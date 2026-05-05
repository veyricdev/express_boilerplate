import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PERM_CONTACTS_DELETE, PERM_CONTACTS_READ } from '~/common/constants/permissions'
import { ApiWrappedResponse } from '~/common/decorators/api-response.decorator'
import { RequirePermissions } from '~/common/decorators/require-permissions.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { PermissionsGuard } from '~/common/guards/permissions.guard'
import { ContactsService } from '../contacts.service'
import { ContactResponseDto } from '../dto/contact-response.dto'
import { FindContactsDto } from '../dto/find-contacts.dto'

@ApiTags('Admin Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/contacts')
export class AdminContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @RequirePermissions(PERM_CONTACTS_READ)
  @ApiOperation({ summary: 'List contact submissions (filter by isRead)' })
  findAll(@Query() query: FindContactsDto) {
    return this.contactsService.findAll(query)
  }

  @Get(':id')
  @RequirePermissions(PERM_CONTACTS_READ)
  @ApiOperation({ summary: 'Get contact detail (auto marks as read)' })
  @ApiWrappedResponse(ContactResponseDto)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.findOne(id)
  }

  @Patch(':id/read')
  @RequirePermissions(PERM_CONTACTS_READ)
  @ApiOperation({ summary: 'Toggle read/unread status' })
  @ApiWrappedResponse(ContactResponseDto)
  toggleRead(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.toggleRead(id)
  }

  @Delete(':id')
  @RequirePermissions(PERM_CONTACTS_DELETE)
  @ApiOperation({ summary: 'Delete contact submission' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.contactsService.remove(id)
    return null
  }
}
