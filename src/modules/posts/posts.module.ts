import { Module } from '@nestjs/common'
import { AdminPostsController } from './admin/admin-posts.controller'
import { ClientPostsController } from './client/client-posts.controller'
import { PostsService } from './posts.service'

@Module({
  controllers: [AdminPostsController, ClientPostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
