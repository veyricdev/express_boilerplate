import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '~/common/decorators/api-response.decorator'
import { ContactsService } from '../contacts.service'
import { ContactResponseDto } from '../dto/contact-response.dto'
import { CreateContactDto } from '../dto/create-contact.dto'

@ApiTags('Contact')
@Controller('contacts')
export class ClientContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact form (public)' })
  @ApiWrappedResponse(ContactResponseDto, { status: 201 })
  create(@Body() dto: CreateContactDto) {
    return this.contactsService.create(dto)
  }
}
