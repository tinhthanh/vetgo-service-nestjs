import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Tạo ứng dụng NestJS
  const app = await NestFactory.create(AppModule);

  // Lấy ConfigService từ AppModule
  const configService = app.get(ConfigService);

  // Lấy các biến môi trường từ ConfigService
  const amqpUrl = configService.get<string>('AMQP_URL'); // URL của RabbitMQ, giá trị mặc định nếu không có
  const queueName = configService.get<string>('QUEUE_NAME_PRODUCER'); // Tên queue, giá trị mặc định nếu không có

  // Tạo microservice với cấu hình từ biến môi trường
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [amqpUrl],
      queue: queueName,
      queueOptions: {
        durable: false,
      },
    },
  });

  await microservice.listen();
  console.log(`Producer Service is running on queue: ${queueName}`);
}
bootstrap();
