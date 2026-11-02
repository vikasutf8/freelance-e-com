import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
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
import { PaymentResponseDto } from '../payments/dto/payment-response.dto';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Missing, invalid, or expired token.',
  type: ErrorResponseDto,
})
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Get the current user cart',
    description:
      'Returns the cart with items, captured prices, per-item subtotals, and the server-calculated total. A cart is created lazily on first use.',
  })
  @ApiOkResponse({
    description: 'Current cart.',
    type: CartResponseDto,
  })
  async getCart(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CartResponseDto> {
    return this.cartService.getCart(user.userId);
  }

  @Post('items')
  @ApiOperation({
    summary: 'Add an item to the cart',
    description:
      'Adds a product or increases its quantity. Rejects quantities above available stock. priceAtAdd is captured from the current product price.',
  })
  @ApiCreatedResponse({
    description: 'Updated cart.',
    type: CartResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or insufficient stock.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found or deleted.',
    type: ErrorResponseDto,
  })
  async addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem(user.userId, dto);
  }

  @Put('items/:id')
  @ApiOperation({
    summary: 'Update a cart item quantity',
    description:
      'Sets the quantity for an item owned by the current user. Rejects quantities above available stock.',
  })
  @ApiParam({ name: 'id', type: Number, example: 10 })
  @ApiOkResponse({
    description: 'Updated cart.',
    type: CartResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or insufficient stock.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Cart or cart item not found.',
    type: ErrorResponseDto,
  })
  async updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateItem(user.userId, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({
    summary: 'Remove a cart item',
    description: 'Removes one item from the current user cart.',
  })
  @ApiParam({ name: 'id', type: Number, example: 10 })
  @ApiOkResponse({
    description: 'Updated cart.',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Cart or cart item not found.',
    type: ErrorResponseDto,
  })
  async removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CartResponseDto> {
    return this.cartService.removeItem(user.userId, id);
  }

  @Post('checkout')
  @ApiOperation({
    summary: 'Create or refresh a pending UPI payment',
    description:
      'Re-checks product availability, recomputes the total on the server, and creates (or refreshes) a pending payment. Returns the payment with a upi:// deep link for the QR code. In manual mode the customer pays, submits the 12-digit UTR, and an admin confirms it. In mock mode the client can call POST /payments to settle immediately.',
  })
  @ApiCreatedResponse({
    description: 'Pending payment with UPI link.',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Cart is empty or a product is unavailable or understocked.',
    type: ErrorResponseDto,
  })
  async checkout(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaymentResponseDto> {
    return this.cartService.checkout(user.userId);
  }
}
