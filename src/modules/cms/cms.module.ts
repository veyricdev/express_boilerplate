import { Module } from '@nestjs/common'
import { ViteService } from '~/shared/vite/vite.service'
import { CmsController } from './cms.controller'

@Module({
  controllers: [CmsController],
  providers: [ViteService],
})
export class CmsModule {}
