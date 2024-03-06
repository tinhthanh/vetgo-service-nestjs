import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import CreateOrderDto from './dto/create-order.dto';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}
  @Post()
  async create(@Body() post: CreateOrderDto) {
    return this.orderService.create(post);
  }

  @Post('create-many')
  async createMany(@Body() list: CreateOrderDto[]) {
    return this.orderService.createMany(list);
  }
}
