import { prisma } from '~/configs/db'
import type { User } from '~/prisma/generated/prisma/client'
import type { UserListQuery } from './user.schema'

class UserService {
  private readonly userOmit = {
    password: true,
  }

  private readonly notDeletedWhere = {
    deletedAt: null,
  }

  async findAll({ page, limit, withTrashed }: UserListQuery) {
    const skip = (page - 1) * limit
    const whereClause = withTrashed ? {} : this.notDeletedWhere
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        omit: this.userOmit,
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: number, withTrashed?: boolean) {
    return await prisma.user.findUnique({
      where: { id, ...(withTrashed ? {} : this.notDeletedWhere) },
      omit: this.userOmit,
    })
  }

  async createOrUpdate({ id, ...info }: User) {
    return await prisma.user.upsert({
      where: { id, email: info.email, username: info.username, deletedAt: null },
      create: info,
      update: info,
      omit: this.userOmit,
    })
  }

  async delete(id: number) {
    const userDeleted = await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      omit: this.userOmit,
    })
    return !!userDeleted
  }

  async destroy(id: number) {
    const userDestroy = await prisma.user.delete({ where: { id }, omit: this.userOmit })
    return !!userDestroy
  }

  async restore(id: number) {
    return await prisma.user.update({
      where: { id },
      data: { deletedAt: null },
      omit: this.userOmit,
    })
  }
}

export const userService = new UserService()
