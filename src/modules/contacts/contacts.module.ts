import { Module } from '@nestjs/common'
import { PrismaModule } from '~/prisma/prisma.module'
import { AdminContactsController } from './admin/admin-contacts.controller'
import { ClientContactsController } from './client/client-contacts.controller'
import { ContactsService } from './contacts.service'

@Module({
  imports: [PrismaModule],
  controllers: [ClientContactsController, AdminContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}
