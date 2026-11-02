import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { OrdersModule } from '../orders/orders.module';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { PaymentSettings } from './entities/payment-settings.entity';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentSettings,
      Cart,
      CartItem,
      Product,
      User,
    ]),
    OrdersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
