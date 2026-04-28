import { Module } from '@nestjs/common'
import { AdminUsersController } from './admin/admin-users.controller'
import { ClientUsersController } from './client/client-users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [ClientUsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
