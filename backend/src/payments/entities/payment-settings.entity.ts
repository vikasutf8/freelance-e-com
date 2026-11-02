import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payment_settings')
export class PaymentSettings {
  @PrimaryColumn({ type: 'tinyint' })
  id: number;

  @Column({ type: 'longblob', nullable: true, select: false })
  qrImageData: Buffer | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  qrImageMimeType: string | null;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  qrImageUpdatedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  updatedBy: number | null;

  @UpdateDateColumn({ type: 'datetime', precision: 6 })
  updatedAt: Date;
}
