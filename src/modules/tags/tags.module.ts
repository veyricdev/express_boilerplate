import { Module } from '@nestjs/common'
import { AdminTagsController } from './admin/admin-tags.controller'
import { ClientTagsController } from './client/client-tags.controller'
import { TagsService } from './tags.service'

@Module({
  controllers: [AdminTagsController, ClientTagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
