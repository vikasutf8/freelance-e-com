import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { Product } from '../../products/entities/product.entity';
import { Cart } from './cart.entity';

@Entity('cart_items')
@Index('UQ_cart_items_cart_product', ['cartId', 'productId'], { unique: true })
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cartId: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  priceAtAdd: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart?: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product?: Product;
}
