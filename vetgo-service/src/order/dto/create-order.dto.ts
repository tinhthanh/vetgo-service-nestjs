import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export enum PaymentType {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
}
export enum OrderStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT', // chờ thanh toán
  PARTIAL_PAYMENT = 'PARTIAL_PAYMENT', //  "Đã thanh toán một phần",
  COMPLETED = 'COMPLETED', //  "Đã hoàn thành",
  CANCELLED = 'CANCELLED', // "Đã hủy"
}
export class InvoiceDetails {
  productCode: string;
  productName: string;
  quantity: number;
  price: number; // đơn giá , giá bán = đơn giá - giảm giá
  cost: number; // chi phí
  discount: number;
  discountRatio: number; // double 0.01 = 0.01%
  note: string;
}

export class CustomerOrder {
  id: string;
  code: string;
  name: string;
  gender: boolean;
  birthDate: string;
  contactNumber: string;
  address: string;
  email: string;
  comment: string;
}
export default class CreateOrderDto {
  id?: string;
  code?: string; // duoc cap nhat tren server
  @IsNotEmpty()
  branchId: string;
  customerId: any;
  discount: number;
  isRatio: boolean;
  discountRatio: number;
  totalPayment: number; // tong tien khach da thanh toan
  userPayment: number; // tiên khách đưa chưa trừ tiên thối lại
  includedInDebt: boolean; // có cộng vào công nợ không
  @IsNotEmpty()
  method: PaymentType; // phương thức thanh
  bankCode: string; // ma ngan hang nhận tiền
  bankNumber: string; // tai khoan nhan tien
  @IsNotEmpty()
  soldById: number; // ma nhan vien ban hang
  @IsNotEmpty()
  soldByName: string; // tên nhan viên
  orderId: any; // sane id
  description: string;
  total?: number; // tổng tiền đơn hàng sau giảm giá == Khácg phải trả
  createdDate?: string;
  status?: OrderStatus;
  customer: CustomerOrder;
  invoiceDetails: InvoiceDetails[];
  @IsNotEmpty()
  retailer: string;
}
