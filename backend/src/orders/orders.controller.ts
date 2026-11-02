import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
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
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import {
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from './dto/order-response.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Missing, invalid, or expired token.',
  type: ErrorResponseDto,
})
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'List order history',
    description:
      'Clients receive only their own paid orders, newest first. Admins receive every order and can search by customer email, order ID, or product name.',
  })
  @ApiOkResponse({
    description: 'Paginated order history.',
    type: PaginatedOrdersResponseDto,
  })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryOrdersDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.ordersService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one order',
    description:
      'Returns an immutable snapshot of the purchased items. Owners and admins can read an order.',
  })
  @ApiParam({ name: 'id', type: Number, example: 18 })
  @ApiOkResponse({
    description: 'Order.',
    type: OrderResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Order belongs to another user.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found.',
    type: ErrorResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id, user);
  }
}
