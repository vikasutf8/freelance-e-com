import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a client account',
    description:
      'Creates a client account and returns a JWT. The role field from the request body is ignored. Returns 403 once MAX_CLIENTS (default 1000) client accounts exist.',
  })
  @ApiCreatedResponse({
    description: 'Account created and authenticated.',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Registrations are closed (client limit reached).',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email already registered.',
    type: ErrorResponseDto,
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Log in and receive a JWT',
    description:
      'Rate limited to 5 requests per minute per IP. Use the token as Authorization: Bearer <token> on protected routes.',
  })
  @ApiOkResponse({
    description: 'Authenticated.',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password.',
    type: ErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many login attempts.',
    type: ErrorResponseDto,
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get the current user',
    description: 'Returns the user identified by the JWT.',
  })
  @ApiOkResponse({
    description: 'Current user.',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
    type: ErrorResponseDto,
  })
  async me(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.authService.me(user.userId);
  }
}
