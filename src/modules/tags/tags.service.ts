import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PaginationDto } from '~/common/dtos/pagination.dto'
import { TrashMode } from '~/common/enums/trash-mode.enum'
import { paginate } from '~/common/helpers/pagination.helper'
import { PrismaService } from '~/prisma/prisma.service'
import { slugify } from '~/utils/slug.util'
import type { CreateTagDto, UpdateTagDto } from './dto/tag.dto'

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  // ─── Public ───────────────────────────────────────────────────────────────

  async findAll(pagination: PaginationDto) {
    return paginate(
      this.prisma.db.tag,
      {
        where: {
          deletedAt: undefined,
          name: pagination.search ? { contains: pagination.search } : undefined,
        },
        orderBy: { createdAt: 'desc' },
      },
      pagination
    )
  }

  async findOnePublic(id: number) {
    const tag = await this.prisma.db.tag.findUnique({
      where: { id, deletedAt: undefined } as any,
    })
    if (!tag) throw new NotFoundException('Tag not found')
    return tag
  }

  // ─── Admin ───────────────────────────────────────────────────────────────

  async findAllAdmin(
    pagination: PaginationDto,
    query?: { search?: string; trashMode?: TrashMode; fromDate?: string; toDate?: string }
  ) {
    const trashMode = query?.trashMode || TrashMode.ACTIVE

    return paginate(
      this.prisma.db.tag,
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
        include: { _count: { select: { postTags: true } } },
        orderBy: { createdAt: 'desc' },
      },
      pagination
    )
  }

  async findOneAdmin(id: number) {
    const tag = await this.prisma.db.tag.findUnique({
      where: { id, deletedAt: undefined } as any,
    })
    if (!tag) throw new NotFoundException('Tag not found')
    return tag
  }

  async create(dto: CreateTagDto) {
    const slug = dto.slug || slugify(dto.name)
    // Idempotent: return non-deleted tag if exists
    const existing = await this.prisma.db.tag.findFirst({ where: { slug } })
    if (existing) return existing

    return this.prisma.db.tag.create({ data: { name: dto.name, slug } })
  }

  async update(id: number, dto: UpdateTagDto) {
    await this.findOneAdmin(id)

    let slug: string | undefined
    if (dto.slug) {
      slug = dto.slug
    } else if (dto.name) {
      slug = slugify(dto.name)
    }

    if (slug) {
      const existing = await this.prisma.db.tag.findFirst({ where: { slug } })
      if (existing && existing.id !== id) {
        throw new ConflictException('Tag with this name or slug already exists')
      }
    }

    return this.prisma.db.tag.update({
      where: { id },
      data: { ...dto, ...(slug ? { slug } : {}) },
    })
  }

  /** Soft delete */
  async remove(id: number) {
    const oldTag = await this.findOneAdmin(id)
    const deleted = await this.prisma.db.tag.update({
      where: { id, deletedAt: undefined } as any,
      data: { deletedAt: new Date() },
    })
    await this.prisma.logAudit('SOFT_DELETE', 'TAG', id, oldTag, deleted)
    return deleted
  }

  /** Restore a soft-deleted tag */
  async restore(id: number) {
    const tag = await this.findOneAdmin(id)
    if (!tag.deletedAt) throw new ConflictException('Tag is not deleted')

    const restored = await this.prisma.db.tag.update({
      where: { id, deletedAt: undefined } as any,
      data: { deletedAt: null },
    })
    await this.prisma.logAudit('RESTORE', 'TAG', id, tag, restored)
    return restored
  }

  /** Hard delete — permanently removes */
  async hardDelete(id: number) {
    const oldTag = await this.findOneAdmin(id)

    await this.prisma.logAudit('HARD_DELETE', 'TAG', id, oldTag)
    return this.prisma.db.tag.delete({
      where: { id, deletedAt: undefined } as any,
    })
  }
}
