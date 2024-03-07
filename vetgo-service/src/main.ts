import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // add middleware validate dữ liệu gửi lên controller
  console.log(process.env.NODE_ENV);
  const config = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  console.log(config.get('PORT'));
  await app.listen(config.get('PORT'));
}
bootstrap();
