import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PERM_SETTINGS_READ, PERM_SETTINGS_WRITE } from '~/common/constants/permissions'
import { RequirePermissions } from '~/common/decorators/require-permissions.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { PermissionsGuard } from '~/common/guards/permissions.guard'
import { CreateSettingDto } from '../dto/create-setting.dto'
import { UpdateSettingMetadataDto } from '../dto/update-setting-metadata.dto'
import { BulkUpdateSettingsDto } from '../dto/update-settings.dto'
import { SettingsService } from '../settings.service'

@ApiTags('Admin Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermissions(PERM_SETTINGS_READ)
  @ApiOperation({ summary: 'List all settings grouped by category' })
  findAll() {
    return this.settingsService.getAll()
  }

  @Post()
  @RequirePermissions(PERM_SETTINGS_WRITE)
  @ApiOperation({ summary: 'Create a new custom setting' })
  create(@Body() dto: CreateSettingDto) {
    return this.settingsService.create(dto)
  }

  @Patch('bulk')
  @RequirePermissions(PERM_SETTINGS_WRITE)
  @ApiOperation({ summary: 'Bulk update multiple settings at once' })
  async bulkUpdate(@Body() dto: BulkUpdateSettingsDto) {
    await this.settingsService.bulkUpdate(dto.settings)
    return null
  }

  @Patch(':key')
  @RequirePermissions(PERM_SETTINGS_WRITE)
  @ApiOperation({ summary: 'Update setting metadata and value' })
  updateMetadata(@Param('key') key: string, @Body() dto: UpdateSettingMetadataDto) {
    return this.settingsService.updateMetadata(key, dto)
  }

  @Delete(':key')
  @RequirePermissions(PERM_SETTINGS_WRITE)
  @ApiOperation({ summary: 'Delete a custom setting' })
  async delete(@Param('key') key: string) {
    await this.settingsService.delete(key)
    return null
  }
}
