import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { TrashMode } from '~/common/enums/trash-mode.enum'
import { paginate } from '~/common/helpers/pagination.helper'
import type { Prisma } from '~/prisma/generated/prisma'
import { PrismaService } from '~/prisma/prisma.service'
import { FindUsersAdminDto } from './dto/find-users-admin.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: FindUsersAdminDto) {
    const { page, limit, search, trashMode } = query

    return paginate(
      this.prisma.db.user,
      {
        where: {
          ...(trashMode === TrashMode.TRASH ? { deletedAt: { not: null } } : {}),
          ...(trashMode === TrashMode.ALL ? { deletedAt: { not: undefined } } : {}),
          OR: search ? [{ fullName: { contains: search } }, { email: { contains: search } }] : undefined,
        },
        orderBy: { createdAt: 'desc' },
      },
      { page, limit }
    )
  }

  async findOne(id: number) {
    return this.prisma.unfiltered.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string) {
    return this.prisma.db.user.findFirst({ where: { email } })
  }

  async create(dto: any) {
    const { password, permissions, ...rest } = dto

    const existing = await this.findByEmail(rest.email)
    if (existing) throw new ConflictException('Email already registered')

    const passwordHash = await bcrypt.hash(password, 10)

    return this.prisma.db.user.create({
      data: {
        ...rest,
        passwordHash,
        permissions: permissions ? BigInt(permissions) : undefined,
      },
    })
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.db.user.update({ where: { id }, data })
  }

  /**
   * Soft delete user:
   * 1. Revoke all active RefreshTokens immediately.
   * 2. Set deletedAt on user.
   */
  async delete(id: number) {
    const user = await this.prisma.unfiltered.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')

    // Step 1: Revoke all active refresh tokens
    await this.prisma.unfiltered.refreshToken.updateMany({
      where: { userId: id, revoked: false },
      data: { revoked: true },
    })

    // Step 2: Soft delete
    const deleted = await this.prisma.unfiltered.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    await this.prisma.logAudit('SOFT_DELETE', 'USER', id, user, deleted)
    return deleted
  }

  /** Restore a soft-deleted user */
  async restore(id: number) {
    const user = await this.prisma.unfiltered.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    if (user.deletedAt === null) throw new ConflictException('User is not deleted')

    const restored = await this.prisma.unfiltered.user.update({
      where: { id },
      data: { deletedAt: null },
    })

    await this.prisma.logAudit('RESTORE', 'USER', id, user, restored)
    return restored
  }

  /** Hard delete — permanently removes user (cascade deletes RefreshTokens via DB) */
  async hardDelete(id: number) {
    const user = await this.prisma.unfiltered.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')

    await this.prisma.logAudit('HARD_DELETE', 'USER', id, user)
    return this.prisma.unfiltered.user.delete({ where: { id } })
  }

  /** Update user permissions using BigInt bit flags */
  async updatePermissions(id: number, permissions: bigint) {
    return this.prisma.db.user.update({
      where: { id },
      data: { permissions },
    })
  }

  /** Set user active/inactive */
  async setStatus(id: number, isActive: boolean) {
    return this.prisma.db.user.update({
      where: { id },
      data: { isActive },
    })
  }
}
