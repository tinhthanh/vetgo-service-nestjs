import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateOrderDto from './dto/create-order.dto';
import { Prisma } from '@prisma/client';
@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}
  async createMany(data: CreateOrderDto[]): Promise<Prisma.BatchPayload> {
    return this.prisma.orderModel.createMany({
      data: data.map((order) => adapter(order)),
      skipDuplicates: true, // Set to `true` to skip the creation of records that would result in unique constraint violation.
    });
  }
  async create(order: CreateOrderDto) {
    return this.prisma.orderModel.create({
      data: adapter(order),
    });
  }
}
export const adapter = (order: CreateOrderDto) => {
  return {
    id: order.id,
    code: order.code,
    branchId: order.branchId,
    customerId: order.customerId,
    discount: order.discount,
    isRatio: order.isRatio,
    discountRatio: order.discountRatio,
    totalPayment: order.totalPayment,
    userPayment: order.userPayment,
    includedInDebt: order.includedInDebt,
    method: order.method,
    bankCode: order.bankCode,
    bankNumber: order.bankNumber,
    soldById: String(order.soldById),
    soldByName: order.soldByName,
    orderId: order.orderId,
    description: order.description,
    total: order.total,
    createdDate: order.createdDate,
    status: order.status,
    customer: order.customer as any,
    invoiceDetails: order.invoiceDetails as any,
    retailer: order.retailer,
  };
};
