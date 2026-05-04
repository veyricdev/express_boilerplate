import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PaginationDto } from '~/common/dtos/pagination.dto'
import { TrashMode } from '~/common/enums/trash-mode.enum'
import { paginate } from '~/common/helpers/pagination.helper'
import { PostStatus } from '~/prisma/generated/prisma'
import { PrismaService } from '~/prisma/prisma.service'
import { slugify } from '~/utils/slug.util'
import { CreatePostDto } from './dto/create-post.dto'
import type { UpdatePostDto } from './dto/update-post.dto'

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  // ─── Admin Methods ────────────────────────────────────────────────────────

  async findAllAdmin(
    pagination: PaginationDto,
    query?: {
      categoryId?: number
      tagId?: number
      status?: PostStatus
      search?: string
      trashMode?: TrashMode
    }
  ) {
    const trashMode = query?.trashMode || TrashMode.ACTIVE

    return paginate(
      this.prisma.db.post,
      {
        where: {
          ...(trashMode === TrashMode.TRASH ? { deletedAt: { not: null } } : {}),
          ...(trashMode === TrashMode.ALL ? { deletedAt: { not: undefined } } : {}),
          // Note: If trashMode is ACTIVE (default), we don't pass deletedAt here,
          // and the Prisma extension auto-injects { deletedAt: null }.
          // Passing { not: undefined } is a trick to bypass the extension's 'in' check.
          categoryId: query?.categoryId,
          status: query?.status,
          postTags: query?.tagId ? { some: { tagId: query.tagId } } : undefined,
          OR: query?.search
            ? [{ title: { contains: query.search } }, { content: { contains: query.search } }]
            : undefined,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, fullName: true, avatarUrl: true } },
          postTags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      },
      pagination
    )
  }

  // Admin can view any post — including soft-deleted ones (needed for restore UI)
  async findOneAdmin(id: number) {
    const post = await this.prisma.db.post.findUnique({
      where: { id, deletedAt: undefined },
      include: {
        category: true,
        author: { select: { id: true, fullName: true, avatarUrl: true } },
        postTags: { include: { tag: true } },
      },
    })
    if (!post) throw new NotFoundException('Post not found')
    return post
  }

  async create(authorId: number, dto: CreatePostDto) {
    const { tagIds, publishedAt, slug: customSlug, categoryId, ...postData } = dto
    const baseSlug = slugify(customSlug || dto.title)

    // Slug uniqueness check — only against non-deleted posts
    const existing = await this.prisma.db.post.findFirst({
      where: { slug: baseSlug },
      select: { id: true },
    })
    const slug = existing ? `${baseSlug}-${Date.now().toString().slice(-5)}` : baseSlug

    // publishedAt: manual value takes priority; if publishing now with no date, auto-set
    const resolvedPublishedAt =
      publishedAt instanceof Date ? publishedAt : postData.status === PostStatus.PUBLISHED ? new Date() : null

    return this.prisma.db.post.create({
      data: {
        ...postData,
        status: postData.status,
        slug,
        author: { connect: { id: authorId } },
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
        publishedAt: resolvedPublishedAt,
        postTags: tagIds?.length ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
      },
      include: {
        category: true,
        postTags: { include: { tag: true } },
      },
    })
  }

  async update(id: number, dto: UpdatePostDto) {
    await this.findOneAdmin(id) // throws if not found (includes soft-deleted)

    const { tagIds, status, publishedAt, slug: customSlug, categoryId, ...rest } = dto

    // Handle tag replacement
    if (tagIds !== undefined) {
      await this.prisma.db.postTag.deleteMany({ where: { postId: id } })
    }

    // Handle slug
    let updatedSlug: string | undefined
    const slugToCheck = customSlug || rest.title
    if (slugToCheck) {
      const baseSlug = slugify(slugToCheck)
      const existing = await this.prisma.db.post.findFirst({
        where: { slug: baseSlug, id: { not: id } },
        select: { id: true },
      })
      updatedSlug = existing ? `${baseSlug}-${Date.now().toString().slice(-5)}` : baseSlug
    }

    // publishedAt logic on update:
    // - Explicit date from DTO → use it
    // - Status changed to PUBLISHED with no date → preserve existing or set now
    // - Status changed to DRAFT → clear publishedAt
    let resolvedPublishedAt: Date | null | undefined
    if (publishedAt instanceof Date) {
      resolvedPublishedAt = publishedAt
    } else if (status === PostStatus.PUBLISHED) {
      const existing = await this.prisma.db.post.findUnique({
        where: { id, deletedAt: undefined },
        select: { publishedAt: true },
      })
      resolvedPublishedAt = existing?.publishedAt ?? new Date()
    } else if (status === PostStatus.DRAFT) {
      resolvedPublishedAt = null
    }

    return this.prisma.db.post.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined && {
          category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
        }),
        ...(updatedSlug !== undefined && { slug: updatedSlug }),
        ...(status !== undefined && { status }),
        ...(resolvedPublishedAt !== undefined && { publishedAt: resolvedPublishedAt }),
        ...(tagIds !== undefined && {
          postTags: { create: tagIds.map((tagId) => ({ tagId })) },
        }),
      },
      include: {
        category: true,
        postTags: { include: { tag: true } },
      },
    })
  }

  /** Soft delete — marks deletedAt, record remains in DB */
  async remove(id: number) {
    const oldPost = await this.findOneAdmin(id)
    const deleted = await this.prisma.db.post.update({
      where: { id, deletedAt: undefined } as any,
      data: { deletedAt: new Date() },
    })

    await this.prisma.logAudit('SOFT_DELETE', 'POST', id, oldPost, deleted)
    return deleted
  }

  /** Restore a soft-deleted post */
  async restore(id: number) {
    const post = await this.findOneAdmin(id)
    if (!post.deletedAt) throw new ConflictException('Post is not deleted')

    const restored = await this.prisma.db.post.update({
      where: { id, deletedAt: undefined } as any,
      data: { deletedAt: null },
    })

    await this.prisma.logAudit('RESTORE', 'POST', id, post, restored)
    return restored
  }

  /** Hard delete — permanently removes record from DB */
  async hardDelete(id: number) {
    const oldPost = await this.findOneAdmin(id)

    await this.prisma.logAudit('HARD_DELETE', 'POST', id, oldPost)
    return this.prisma.db.post.delete({
      where: { id, deletedAt: undefined } as any,
    })
  }

  // ─── Client Methods (Public) ─────────────────────────────────────────────

  async findAllPublished(
    pagination: PaginationDto,
    query?: {
      categoryId?: number
      tagId?: number
      search?: string
    }
  ) {
    const now = new Date()
    return paginate(
      this.prisma.db.post,
      {
        where: {
          status: PostStatus.PUBLISHED,
          publishedAt: { lte: now }, // Exclude future-scheduled posts
          categoryId: query?.categoryId,
          postTags: query?.tagId ? { some: { tagId: query.tagId } } : undefined,
          OR: query?.search
            ? [{ title: { contains: query.search } }, { excerpt: { contains: query.search } }]
            : undefined,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail: true,
          publishedAt: true,
          metaTitle: true,
          metaDescription: true,
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, fullName: true, avatarUrl: true } },
          postTags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        },
        orderBy: { publishedAt: 'desc' },
      },
      pagination
    )
  }

  async findBySlug(slug: string) {
    const now = new Date()
    const post = await this.prisma.db.post.findFirst({
      where: {
        slug,
        status: PostStatus.PUBLISHED,
        publishedAt: { lte: now },
      },
      include: {
        category: true,
        author: { select: { id: true, fullName: true, avatarUrl: true } },
        postTags: { include: { tag: true } },
      },
    })
    if (!post) throw new NotFoundException('Post not found')
    return post
  }
}
