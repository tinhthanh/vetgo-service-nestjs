import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Tạo ứng dụng NestJS từ AppModule
  const app = await NestFactory.create(AppModule);

  // Lấy ConfigService từ AppModule
  const configService = app.get(ConfigService);

  // Lấy các biến môi trường từ ConfigService
  const amqpUrl = configService.get<string>('AMQP_URL'); // URL của RabbitMQ
  const queueName = configService.get<string>('QUEUE_NAME_CONSUMER'); // Tên queue

  // Tạo microservice với cấu hình từ biến môi trường
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
              urls: [amqpUrl],
              queue: queueName,
       // false = manual acknowledgement; true = automatic acknowledgment
              // Consumer phải thủ công xác nhận rằng nó đã xử lý xong thông điệp bằng cách gửi lại một thông điệp "ack" (acknowledgment) cho RabbitMQ.
              // Nếu Consumer gặp lỗi hoặc bị ngắt kết nối trước khi gửi xác nhận, RabbitMQ sẽ phát lại thông điệp đó cho một Consumer khác để đảm bảo không có thông điệp nào bị mất.
              noAck: false, // false cần consumer xác nhận là xong task , = true cho case gửi đi k cần biết nó làm xong chưa, cứ gửi đi là coi như done
              // Get one by one
              // Số lượng thông điệp tối đa Consumer có thể nhận trước
              // 1RabbitMQ chỉ gửi 1 thông điệp đến Consumer tại một thời điểm và chờ cho đến khi thông điệp đó được xác nhận (ack) trước khi gửi tiếp thông điệp tiếp theo. Điều này đảm bảo Consumer chỉ xử lý một thông điệp duy nhất mỗi lần, tránh bị quá tải.
              prefetchCount: 1,
              queueOptions: {
                durable: false,
              },
    },
  });

  await microservice.listen();
  console.log(`Consumer chrome profile Service is running on queue: ${queueName}`);
}

bootstrap();
