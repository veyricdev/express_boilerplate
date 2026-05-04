import { Module } from '@nestjs/common'
import { AdminSettingsController } from './admin/admin-settings.controller'
import { ClientSettingsController } from './client/client-settings.controller'
import { SettingsService } from './settings.service'

@Module({
  controllers: [ClientSettingsController, AdminSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
