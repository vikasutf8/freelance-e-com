import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateProductDto } from './dto/create-product.dto';
import { PaginatedProductsDto } from './dto/paginated-products.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List products (public)',
    description:
      'Paginated list of active products, newest first. Soft-deleted products are excluded. Default limit is 20; the shop enforces a maximum of 100 active products.',
  })
  @ApiOkResponse({
    description: 'Paginated products.',
    type: PaginatedProductsDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid pagination parameters.',
    type: ErrorResponseDto,
  })
  async findAll(
    @Query() query: QueryProductsDto,
  ): Promise<PaginatedProductsDto> {
    return this.productsService.findAll(query);
  }

  @Get(':id/image')
  @ApiOperation({
    summary: 'Get a product image (public)',
    description:
      'Streams the uploaded PNG/JPEG stored in MySQL. Responses are immutable and can be cached indefinitely; changing the image updates the URL version.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiProduces('image/png', 'image/jpeg')
  @ApiOkResponse({
    description: 'Product image bytes.',
    schema: { type: 'string', format: 'binary' },
  })
  @ApiNotFoundResponse({
    description: 'Product or image not found.',
    type: ErrorResponseDto,
  })
  async findImage(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const image = await this.productsService.findImage(id);

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

  @Get(':id')
  @ApiOperation({ summary: 'Get a product (public)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Product.',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found or deleted.',
    type: ErrorResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a product (admin only)',
    description:
      'Adds a product. Price must be greater than 0 and stock cannot be negative. Returns 409 when MAX_PRODUCTS (default 100) active products already exist; delete a product to free a slot.',
  })
  @ApiCreatedResponse({
    description: 'Product created.',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed.',
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
  @ApiConflictResponse({
    description: 'Product limit (100) reached.',
    type: ErrorResponseDto,
  })
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(dto, user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a product (admin only)',
    description:
      'Updates any provided fields. Existing cart items keep the priceAtAdd captured when they were added.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Updated product.',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed.',
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
    description: 'Product not found or deleted.',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft-delete a product (admin only)',
    description:
      'Marks the product isDeleted=true. It disappears from listings and frees a slot against the 100-product limit.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Product deleted.',
    schema: {
      example: { message: 'Product deleted', id: 1 },
    },
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
    description: 'Product not found or already deleted.',
    type: ErrorResponseDto,
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string; id: number }> {
    return this.productsService.remove(id);
  }
}
