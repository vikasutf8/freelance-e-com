import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { UserRole } from '../users/entities/user.entity';
import { PaginatedPaymentsResponseDto } from './dto/admin-payment-response.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentConfigResponseDto } from './dto/payment-config-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { SubmitPaymentUtrDto } from './dto/submit-payment-utr.dto';
import { UpdatePaymentQrDto } from './dto/update-payment-qr.dto';
import { PaymentStatus } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Simulate a UPI payment (mock mode only)',
    description:
      'Available only when PAYMENT_MODE=mock. Settles the latest pending payment immediately: stock is reduced, an immutable order snapshot is created, cart items are cleared, and the payment is marked success. In manual mode this endpoint returns 403; customers must submit a UTR and an admin confirms it.',
  })
  @ApiCreatedResponse({
    description: 'Payment settled and cart cleared.',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Cart is empty or has invalid items.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Mock payments are disabled.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description:
      'Payment already failed or stock is no longer sufficient. Create a new checkout to retry.',
    type: ErrorResponseDto,
  })
  async simulate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.simulate(user.userId, dto);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Provider callback',
    description:
      'Settles a payment from a trusted provider callback. Send the shared secret in the x-webhook-secret header when PAYMENT_WEBHOOK_SECRET is configured. Real providers should additionally verify their own signature before this endpoint is exposed.',
  })
  @ApiOkResponse({
    description: 'Webhook processed idempotently.',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or the cart is empty.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid webhook secret.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Invalid status transition or insufficient stock.',
    type: ErrorResponseDto,
  })
  async webhook(
    @Body() dto: PaymentWebhookDto,
    @Headers('x-webhook-secret') secret?: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.handleWebhook(dto, secret);
  }

  @Get('config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get storefront payment configuration',
    description:
      'Returns the UPI ID, payee details, payment mode, and the uploaded QR image URL. When qrImageUrl is present, the storefront should display that image instead of the generated UPI QR.',
  })
  @ApiOkResponse({
    description: 'Payment configuration.',
    type: PaymentConfigResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
    type: ErrorResponseDto,
  })
  async getConfig(): Promise<PaymentConfigResponseDto> {
    return this.paymentsService.getConfig();
  }

  @Get('config/qr')
  @ApiOperation({
    summary: 'Get the uploaded payment QR image (public)',
    description:
      'Returns the QR image uploaded by an admin. The versioned URL is safe to cache forever because a new upload changes the version.',
  })
  @ApiProduces('image/png', 'image/jpeg')
  @ApiOkResponse({
    description: 'Payment QR image bytes.',
    schema: { type: 'string', format: 'binary' },
  })
  @ApiNotFoundResponse({
    description: 'No payment QR image has been uploaded.',
    type: ErrorResponseDto,
  })
  async findQrImage(
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const image = await this.paymentsService.findQrImage();

    response.setHeader(
      'Cache-Control',
      'public, max-age=31536000, immutable',
    );
    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    return new StreamableFile(image.data, {
      type: image.mimeType,
      length: image.data.length,
    });
  }

  @Put('config/qr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload or replace the payment QR image (admin only)',
    description:
      'Accepts a base64 PNG or JPEG data URL up to 2 MB. The storefront will show this image in the payment modal instead of the generated UPI QR.',
  })
  @ApiOkResponse({
    description: 'Updated payment configuration.',
    type: PaymentConfigResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or oversized image.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Admin role required.',
    type: ErrorResponseDto,
  })
  async updateQrImage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePaymentQrDto,
  ): Promise<PaymentConfigResponseDto> {
    return this.paymentsService.updateQrImage(user.userId, dto);
  }

  @Delete('config/qr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove the payment QR image (admin only)',
    description:
      'Clears the uploaded image. The storefront falls back to the generated UPI QR.',
  })
  @ApiOkResponse({
    description: 'Updated payment configuration.',
    type: PaymentConfigResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Admin role required.',
    type: ErrorResponseDto,
  })
  async removeQrImage(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaymentConfigResponseDto> {
    return this.paymentsService.removeQrImage(user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List payments (admin only)',
    description:
      'Paginated payments for the admin verification queue. Filter by status and search by customer email, payment ID, or UTR.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PaymentStatus,
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({
    description: 'Paginated payments.',
    type: PaginatedPaymentsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Admin role required.',
    type: ErrorResponseDto,
  })
  async findAll(
    @Query() query: QueryPaymentsDto,
  ): Promise<PaginatedPaymentsResponseDto> {
    return this.paymentsService.findAll(query);
  }

  @Post(':id/utr')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit a UPI reference for verification',
    description:
      'The customer submits the 12-digit UTR/RRN shown in their UPI app. The payment stays pending until an admin confirms or rejects it; no order or stock change happens at this step.',
  })
  @ApiParam({ name: 'id', type: Number, example: 7 })
  @ApiOkResponse({
    description: 'UTR saved; payment remains pending.',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UTR or the payment is not pending.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Payment belongs to another user.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'The UTR is already used or the payment is already settled.',
    type: ErrorResponseDto,
  })
  async submitUtr(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitPaymentUtrDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.submitUtr(id, user.userId, dto);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Confirm a payment (admin only)',
    description:
      'Verifies the UTR against the store bank statement, then in one transaction reduces stock, creates the order, clears the cart, and marks the payment success.',
  })
  @ApiParam({ name: 'id', type: Number, example: 7 })
  @ApiOkResponse({
    description: 'Payment confirmed and order created.',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The customer has not submitted a UTR yet.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Admin role required.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Payment already rejected or stock is no longer sufficient.',
    type: ErrorResponseDto,
  })
  async confirm(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.confirm(id, user.userId);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reject a payment (admin only)',
    description:
      'Marks a pending payment failed without creating an order or changing stock. The cart stays intact so the customer can retry checkout.',
  })
  @ApiParam({ name: 'id', type: Number, example: 7 })
  @ApiOkResponse({
    description: 'Payment rejected.',
    type: PaymentResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Admin role required.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Successful payments cannot be rejected.',
    type: ErrorResponseDto,
  })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RejectPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.reject(id, user.userId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment status',
    description:
      'Poll this endpoint after checkout to observe pending -> success/failed. Owners and admins can read a payment.',
  })
  @ApiParam({ name: 'id', type: Number, example: 7 })
  @ApiOkResponse({
    description: 'Payment.',
    type: PaymentResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Payment belongs to another user.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found.',
    type: ErrorResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.findById(id, user);
  }
}
