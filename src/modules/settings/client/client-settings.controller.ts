import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { SettingsService } from '../settings.service'

@ApiTags('Settings')
@Controller('settings')
export class ClientSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all public settings (no auth required)' })
  findAll() {
    return this.settingsService.getAll()
  }
}
