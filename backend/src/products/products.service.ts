import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  buildProductImageUrl,
  parseProductImageDataUrl,
} from '../common/utils/product-image.util';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginatedProductsDto } from './dto/paginated-products.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async findAll(query: QueryProductsDto): Promise<PaginatedProductsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [products, total] = await this.productsRepository.findAndCount({
      where: { isDeleted: false },
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: products.map((product) => this.toResponse(product)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponse(product);
  }

  async create(
    dto: CreateProductDto,
    userId: number,
  ): Promise<ProductResponseDto> {
    const maxProducts =
      this.configService.get<number>('limits.maxProducts') ?? 100;

    return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      const activeCount = await manager.count(Product, {
        where: { isDeleted: false },
      });

      if (activeCount >= maxProducts) {
        throw new ConflictException(`Product limit (${maxProducts}) reached`);
      }

      const image = dto.image ? parseProductImageDataUrl(dto.image) : null;
      const product = manager.create(Product, {
        name: dto.name.trim(),
        price: dto.price,
        description: dto.description ?? null,
        imageData: image?.data ?? null,
        imageMimeType: image?.mimeType ?? null,
        imageUpdatedAt: image ? new Date() : null,
        stock: dto.stock,
        createdBy: userId,
      });

      const savedProduct = await manager.save(product);
      return this.toResponse(savedProduct);
    });
  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.name !== undefined) {
      product.name = dto.name.trim();
    }
    if (dto.price !== undefined) {
      product.price = dto.price;
    }
    if (dto.description !== undefined) {
      product.description = dto.description;
    }
    if (dto.image !== undefined) {
      if (dto.image === null) {
        product.imageData = null;
        product.imageMimeType = null;
        product.imageUpdatedAt = null;
      } else {
        const image = parseProductImageDataUrl(dto.image);
        product.imageData = image.data;
        product.imageMimeType = image.mimeType;
        product.imageUpdatedAt = new Date();
      }
    }
    if (dto.stock !== undefined) {
      product.stock = dto.stock;
    }

    const savedProduct = await this.productsRepository.save(product);
    return this.toResponse(savedProduct);
  }

  async findImage(
    id: number,
  ): Promise<{ data: Buffer; mimeType: string }> {
    const product = await this.productsRepository.findOne({
      where: { id, isDeleted: false },
      select: {
        id: true,
        imageData: true,
        imageMimeType: true,
      },
    });

    if (!product || !product.imageData || !product.imageMimeType) {
      throw new NotFoundException('Product image not found');
    }

    return {
      data: product.imageData,
      mimeType: product.imageMimeType,
    };
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const product = await this.productsRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.isDeleted = true;
    await this.productsRepository.save(product);

    return { message: 'Product deleted', id };
  }

  private toResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      description: product.description,
      imageUrl: buildProductImageUrl(product),
      stock: product.stock,
      createdBy: product.createdBy,
    };
  }
}
