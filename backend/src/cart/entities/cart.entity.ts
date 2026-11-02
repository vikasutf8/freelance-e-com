import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_carts_user_id', { unique: true })
  @Column({ type: 'int' })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items?: CartItem[];

  @OneToMany(() => Payment, (payment) => payment.cart)
  payments?: Payment[];
}
