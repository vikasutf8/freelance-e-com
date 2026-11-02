import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { User } from '../../users/entities/user.entity';

@Entity('products')
@Index('IDX_products_is_deleted', ['isDeleted'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'longblob', nullable: true, select: false })
  imageData: Buffer | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  imageMimeType: string | null;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  imageUpdatedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'int', nullable: true })
  createdBy: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  creator?: User | null;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems?: CartItem[];
}
