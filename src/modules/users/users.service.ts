import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { TrashMode } from '~/common/enums/trash-mode.enum'
import { paginate } from '~/common/helpers/pagination.helper'
import { PrismaService } from '~/prisma/prisma.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { FindUsersAdminDto } from './dto/find-users-admin.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    username: true,
    fullName: true,
    avatarUrl: true,
    phone: true,
    address: true,
    permissions: true,
    isOwner: true,
    isActive: true,
    lastLoginAt: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
  }

  async findAll(query: FindUsersAdminDto) {
    const { page, limit, search, trashMode, isActive, fromDate, toDate } = query

    return paginate(
      this.prisma.db.user,
      {
        where: {
          ...(trashMode === TrashMode.TRASH ? { deletedAt: { not: null } } : {}),
          ...(trashMode === TrashMode.ALL ? { deletedAt: { not: undefined } } : {}),
          OR: search
            ? [{ fullName: { contains: search } }, { email: { contains: search } }, { username: { contains: search } }]
            : undefined,
          isActive:
            isActive !== undefined ? (typeof isActive === 'string' ? isActive === 'true' : isActive) : undefined,
          createdAt:
            fromDate || toDate
              ? {
                  ...(fromDate ? { gte: new Date(fromDate) } : {}),
                  ...(toDate ? { lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)) } : {}),
                }
              : undefined,
        },
        orderBy: { createdAt: 'desc' },
        select: this.userSelect,
      },
      { page, limit }
    )
  }

  async findOne(id: number) {
    return this.prisma.db.user.findUnique({
      where: { id, deletedAt: undefined } as any, // Pass deletedAt: undefined to bypass filter
      select: this.userSelect,
    })
  }

  /** Special method for Auth system — looks up by email OR username */
  async findForAuth(identifier: string) {
    return this.prisma.db.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    })
  }

  async findByEmail(email: string) {
    return this.prisma.db.user.findFirst({
      where: { email },
      select: this.userSelect,
    })
  }

  async create(dto: CreateUserDto) {
    const { password, permissions, ...rest } = dto

    const existingUser = await this.prisma.db.user.findFirst({
      where: {
        OR: [{ email: rest.email }, { username: rest.username }],
      },
    })

    if (existingUser) {
      if (existingUser.email === rest.email) throw new ConflictException('Email already registered')
      if (existingUser.username === rest.username) throw new ConflictException('Username already taken')
    }

    const passwordHash = await bcrypt.hash(password, 10)

    return this.prisma.db.user.create({
      data: {
        ...rest,
        passwordHash,
        permissions: this.safeBigInt(permissions),
      },
      select: this.userSelect,
    })
  }

  private safeBigInt(val: any): bigint {
    if (!val) return 0n
    try {
      return BigInt(val)
    } catch {
      return 0n
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.db.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')

    const { password, permissions, ...rest } = dto

    const data: any = {
      ...rest,
      permissions: this.safeBigInt(permissions),
    }

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10)
    }

    return this.prisma.db.user.update({
      where: { id },
      data,
      select: this.userSelect,
    })
  }

  /**
   * Soft delete user:
   * 1. Revoke all active RefreshTokens immediately.
   * 2. Set deletedAt on user.
   */
  async delete(id: number) {
    const user = await this.prisma.db.user.findUnique({
      where: { id, deletedAt: undefined } as any,
    })
    if (!user) throw new NotFoundException('User not found')
    if (user.isOwner) throw new ForbiddenException('Owner account cannot be deleted')

    // Step 1: Revoke all active refresh tokens
    await this.prisma.db.refreshToken.updateMany({
      where: { userId: id, revoked: false },
      data: { revoked: true },
    })

    // Step 2: Soft delete
    const deleted = await this.prisma.db.user.update({
      where: { id, deletedAt: undefined } as any,
      data: { deletedAt: new Date() },
      select: this.userSelect,
    })

    await this.prisma.logAudit('SOFT_DELETE', 'USER', id, user, deleted)
    return deleted
  }

  /** Restore a soft-deleted user */
  async restore(id: number) {
    const user = await this.prisma.db.user.findUnique({
      where: { id, deletedAt: undefined } as any,
    })
    if (!user) throw new NotFoundException('User not found')
    if (user.isOwner) throw new ForbiddenException('Owner account cannot be modified')
    if (user.deletedAt === null) throw new ConflictException('User is not deleted')

    const restored = await this.prisma.db.user.update({
      where: { id, deletedAt: undefined } as any,
      data: { deletedAt: null },
      select: this.userSelect,
    })

    await this.prisma.logAudit('RESTORE', 'USER', id, user, restored)
    return restored
  }

  /** Hard delete — permanently removes user (cascade deletes RefreshTokens via DB) */
  async hardDelete(id: number) {
    const user = await this.prisma.db.user.findUnique({
      where: { id, deletedAt: undefined } as any,
    })
    if (!user) throw new NotFoundException('User not found')
    if (user.isOwner) throw new ForbiddenException('Owner account cannot be deleted')

    await this.prisma.logAudit('HARD_DELETE', 'USER', id, user)
    return this.prisma.unfiltered.user.delete({ where: { id } })
  }

  /** Update user permissions using BigInt bit flags */
  async updatePermissions(id: number, permissions: bigint) {
    const user = await this.prisma.db.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    if (user.isOwner) throw new ForbiddenException('Owner account permissions cannot be modified')

    return this.prisma.db.user.update({
      where: { id },
      data: { permissions },
      select: this.userSelect,
    })
  }

  /** Set user active/inactive */
  async setStatus(id: number, isActive: boolean) {
    const user = await this.prisma.db.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    if (user.isOwner) throw new ForbiddenException('Owner account status cannot be modified')

    return this.prisma.db.user.update({
      where: { id },
      data: { isActive },
      select: this.userSelect,
    })
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    const user = await this.prisma.db.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')

    // Check unique email/username if changed
    if (dto.email || dto.username) {
      const existing = await this.prisma.db.user.findFirst({
        where: {
          id: { not: id },
          OR: [...(dto.email ? [{ email: dto.email }] : []), ...(dto.username ? [{ username: dto.username }] : [])],
        },
      })
      if (existing) {
        if (existing.email === dto.email) throw new ConflictException('Email already registered')
        if (existing.username === dto.username) throw new ConflictException('Username already taken')
      }
    }

    return this.prisma.db.user.update({
      where: { id },
      data: dto,
      select: this.userSelect,
    })
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.prisma.db.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')

    const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash)
    if (!isMatch) throw new BadRequestException('Old password is incorrect')

    const passwordHash = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.db.user.update({
      where: { id },
      data: { passwordHash },
    })

    return { message: 'Password updated successfully' }
  }
}
