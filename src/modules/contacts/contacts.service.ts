import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '~/prisma/prisma.service'
import type { CreateContactDto } from './dto/create-contact.dto'
import type { FindContactsDto } from './dto/find-contacts.dto'

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateContactDto) {
    return this.prisma.db.contactSubmission.create({ data: dto })
  }

  async findAll({ page = 1, limit = 20, isRead }: FindContactsDto) {
    const skip = (page - 1) * limit
    const where = isRead !== undefined ? { isRead } : {}

    const [data, total] = await Promise.all([
      this.prisma.db.contactSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.db.contactSubmission.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number) {
    const contact = await this.prisma.db.contactSubmission.findUnique({ where: { id } })
    if (!contact) throw new NotFoundException(`Contact #${id} not found`)
    // Auto mark as read on view
    if (!contact.isRead) {
      return this.prisma.db.contactSubmission.update({ where: { id }, data: { isRead: true } })
    }
    return contact
  }

  async toggleRead(id: number) {
    const contact = await this.prisma.db.contactSubmission.findUnique({ where: { id } })
    if (!contact) throw new NotFoundException(`Contact #${id} not found`)
    return this.prisma.db.contactSubmission.update({
      where: { id },
      data: { isRead: !contact.isRead },
    })
  }

  async remove(id: number) {
    const contact = await this.prisma.db.contactSubmission.findUnique({ where: { id } })
    if (!contact) throw new NotFoundException(`Contact #${id} not found`)
    await this.prisma.db.contactSubmission.delete({ where: { id } })
  }
}
