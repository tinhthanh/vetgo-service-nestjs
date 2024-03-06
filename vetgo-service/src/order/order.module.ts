import { Module } from '@nestjs/common';
import { OrderController } from './order.controler';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [],
})
export class OrderModule {}
