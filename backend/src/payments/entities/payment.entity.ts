import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { Cart } from '../../cart/entities/cart.entity';
import { User } from '../../users/entities/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('payments')
@Index('IDX_payments_status', ['status'])
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cartId: number;

  @Column({ length: 255 })
  upiId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Index('UQ_payments_utr', { unique: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  utr: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  failureReason: string | null;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  reviewedBy: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewedBy' })
  reviewer?: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Cart, (cart) => cart.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart?: Cart;
}
