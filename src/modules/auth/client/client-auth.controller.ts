import { Body, Controller, Post } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { LoginResponseDto } from '../dto/auth-response.dto'
import { LoginDto } from '../dto/login.dto'
import { RegisterDto } from '../dto/register.dto'
import { ClientAuthService } from './client-auth.service'

@ApiTags('Client Auth')
@Controller('auth')
export class ClientAuthController {
  constructor(private readonly authService: ClientAuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiOkResponse({ type: LoginResponseDto })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  @ApiOperation({ summary: 'Login as user' })
  @ApiOkResponse({ type: LoginResponseDto })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }
}
