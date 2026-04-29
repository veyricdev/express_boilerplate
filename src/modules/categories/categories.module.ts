import { Module } from '@nestjs/common'
import { AdminCategoriesController } from './admin/admin-categories.controller'
import { CategoriesService } from './categories.service'
import { ClientCategoriesController } from './client/client-categories.controller'

@Module({
  controllers: [AdminCategoriesController, ClientCategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
