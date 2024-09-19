import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller('gateway')
export class GatewayController {
private client: ClientProxy; // Khai báo biến client là thành viên của class

constructor(private configService: ConfigService) {
  // Khởi tạo biến client trong constructor

  // Lấy các biến môi trường từ ConfigService
  const amqpUrl = this.configService.get<string>('AMQP_URL'); // URL của RabbitMQ
  const queueName = this.configService.get<string>('QUEUE_NAME_PRODUCER'); // Tên queue của consumer

  // Tạo ClientProxy sử dụng RabbitMQ với các cấu hình từ biến môi trường
  this.client = ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [amqpUrl], // URL của RabbitMQ
      queue: queueName, // Tên queue của consumer
      queueOptions: {
        durable: false, // Queue không bền vững (không lưu lại khi RabbitMQ restart)
      },
    },
  });
}
@Get('send')
sendMessage() {
  console.log(`send message to Producer`);
   this.client
    .send('message_pattern', { text: 'Hello from gateway!' }).subscribe();
}
}
