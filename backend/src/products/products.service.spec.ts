import { ConflictException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const productsRepository = {} as never;
  const configService = {
    get: jest.fn().mockReturnValue(100),
  } as never;

  it('rejects creation when the active product limit is reached', async () => {
    const manager = {
      count: jest.fn().mockResolvedValue(100),
      create: jest.fn(),
      save: jest.fn(),
    };
    const dataSource = {
      transaction: jest.fn(
        (_isolation: string, callback: (entityManager: unknown) => unknown) =>
          callback(manager),
      ),
    } as never;

    const service = new ProductsService(
      productsRepository,
      dataSource,
      configService,
    );

    await expect(
      service.create(
        {
          name: 'Keyboard',
          price: 2499.99,
          stock: 5,
        },
        1,
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(manager.save).not.toHaveBeenCalled();
  });

  it('creates a product when a slot is available', async () => {
    const manager = {
      count: jest.fn().mockResolvedValue(99),
      create: jest.fn((_entity: unknown, data: Record<string, unknown>) => data),
      save: jest.fn((data: Record<string, unknown>) =>
        Promise.resolve({ id: 1, ...data }),
      ),
    };
    const dataSource = {
      transaction: jest.fn(
        (_isolation: string, callback: (entityManager: unknown) => unknown) =>
          callback(manager),
      ),
    } as never;

    const service = new ProductsService(
      productsRepository,
      dataSource,
      configService,
    );

    await expect(
      service.create(
        {
          name: 'Keyboard',
          price: 2499.99,
          description: 'Hot-swappable',
          stock: 5,
        },
        7,
      ),
    ).resolves.toEqual({
      id: 1,
      name: 'Keyboard',
      price: 2499.99,
      description: 'Hot-swappable',
      imageUrl: null,
      stock: 5,
      createdBy: 7,
    });
  });
});
