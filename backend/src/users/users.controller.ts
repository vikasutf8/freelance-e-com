import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Missing, invalid, or expired token.',
  type: ErrorResponseDto,
})
@ApiForbiddenResponse({
  description: 'Admin role required.',
  type: ErrorResponseDto,
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'List users (admin only)',
    description: 'Returns all admin and client accounts.',
  })
  @ApiOkResponse({
    description: 'Users ordered by id.',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user (admin only)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'User.', type: UserResponseDto })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a user role (admin only)',
    description:
      'Promote a client to admin or demote an admin. An admin cannot demote their own account.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Updated user.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid role or self-demotion attempt.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.usersService.updateRole(id, dto.role, currentUser.userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user (admin only)',
    description:
      'Deletes the account. The user cart, cart items, payments, orders, and order items are removed by cascading foreign keys. An admin cannot delete their own account.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'User deleted.',
    schema: {
      example: { message: 'User deleted', id: 1 },
    },
  })
  @ApiBadRequestResponse({
    description: 'Self-deletion attempt.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ message: string; id: number }> {
    return this.usersService.remove(id, currentUser.userId);
  }
}
