import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lấy ConfigService từ AppModule
  const configService = app.get(ConfigService);

  // Lấy biến môi trường từ ConfigService
  const amqpUrl = configService.get<string>('AMQP_URL');
  const port = configService.get<number>('PORT');

  // Cấu hình Microservice Client
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [amqpUrl],
      queue: 'api-gateway',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  app.enableCors();
  await app.listen(port);
  console.log(`API Gateway is running on http://localhost:${port}`);
}
bootstrap();
