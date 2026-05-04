import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PaginationDto } from '~/common/dtos/pagination.dto'
import { TrashMode } from '~/common/enums/trash-mode.enum'
import { paginate } from '~/common/helpers/pagination.helper'
import { PrismaService } from '~/prisma/prisma.service'
import { slugify } from '~/utils/slug.util'
import type { CreateCategoryDto } from './dto/create-category.dto'
import type { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // ─── Admin ───────────────────────────────────────────────────────────────

  async findAllAdmin(
    pagination: PaginationDto,
    query?: { search?: string; trashMode?: TrashMode; fromDate?: string; toDate?: string }
  ) {
    const trashMode = query?.trashMode || TrashMode.ACTIVE

    return paginate(
      this.prisma.db.category,
      {
        where: {
          ...(trashMode === TrashMode.TRASH ? { deletedAt: { not: null } } : {}),
          ...(trashMode === TrashMode.ALL ? { deletedAt: { not: undefined } } : {}),
          name: query?.search ? { contains: query.search } : undefined,
          createdAt:
            query?.fromDate || query?.toDate
              ? {
                  ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
                  ...(query.toDate ? { lte: new Date(new Date(query.toDate).setHours(23, 59, 59, 999)) } : {}),
                }
              : undefined,
        },
        include: { _count: { select: { posts: true } } },
        orderBy: { name: 'asc' },
      },
      pagination
    )
  }

  // Admin needs to retrieve soft-deleted categories for restore UI
  async findOneAdmin(id: number) {
    const cat = await this.prisma.db.category.findUnique({
      where: { id, deletedAt: undefined },
    })
    if (!cat) throw new NotFoundException('Category not found')
    return cat
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name)
    // Check conflict only against non-deleted categories
    const existing = await this.prisma.db.category.findFirst({ where: { slug } })
    if (existing) throw new ConflictException('Category with this name already exists')

    return this.prisma.db.category.create({ data: { ...dto, slug } })
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOneAdmin(id)

    let slug: string | undefined
    if (dto.name) {
      slug = slugify(dto.name)
      const existing = await this.prisma.db.category.findFirst({ where: { slug } })
      if (existing && existing.id !== id) {
        throw new ConflictException('Category with this name already exists')
      }
    }

    return this.prisma.db.category.update({
      where: { id },
      data: { ...dto, ...(slug ? { slug } : {}) },
    })
  }

  /** Soft delete — also nullifies categoryId on all linked posts (cascade Option B) */
  async remove(id: number) {
    const oldCat = await this.findOneAdmin(id)

    // Cascade: detach posts from this category before soft-deleting
    await this.prisma.db.post.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    })

    const deleted = await this.prisma.db.category.update({
      where: { id, deletedAt: undefined } as any,
      data: { deletedAt: new Date() },
    })

    await this.prisma.logAudit('SOFT_DELETE', 'CATEGORY', id, oldCat, deleted)
    return deleted
  }

  /** Restore a soft-deleted category */
  async restore(id: number) {
    const cat = await this.findOneAdmin(id)
    if (!cat.deletedAt) throw new ConflictException('Category is not deleted')

    const restored = await this.prisma.db.category.update({
      where: { id, deletedAt: undefined } as any,
      data: { deletedAt: null },
    })

    await this.prisma.logAudit('RESTORE', 'CATEGORY', id, cat, restored)
    return restored
  }

  /** Hard delete — permanently removes from DB */
  async hardDelete(id: number) {
    const oldCat = await this.findOneAdmin(id)
    await this.prisma.logAudit('HARD_DELETE', 'CATEGORY', id, oldCat)
    return this.prisma.db.category.delete({
      where: { id, deletedAt: undefined } as any,
    })
  }

  // ─── Client (Public) ─────────────────────────────────────────────────────

  async findAllPublic(pagination: PaginationDto) {
    const now = new Date()
    return paginate(
      this.prisma.db.category,
      {
        include: {
          _count: {
            select: {
              // Only count visible, published, non-deleted, non-future posts
              posts: {
                where: {
                  status: 'PUBLISHED',
                  publishedAt: { lte: now },
                },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      },
      pagination
    )
  }

  async findBySlug(slug: string) {
    const now = new Date()
    const cat = await this.prisma.db.category.findFirst({
      where: { slug },
      include: {
        posts: {
          where: {
            status: 'PUBLISHED',
            publishedAt: { lte: now },
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
          },
          orderBy: { publishedAt: 'desc' },
        },
      },
    })
    if (!cat) throw new NotFoundException('Category not found')
    return cat
  }
}
