import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from '../../cart/entities/cart.entity';

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_users_email', { unique: true })
  @Column({ length: 255 })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart?: Cart;
}
