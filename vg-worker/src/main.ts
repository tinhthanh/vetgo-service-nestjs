import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(process.env.NODE_ENV);
  const config = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  console.log(config.get('PORT'));
  await app.listen(config.get('PORT'));
}
bootstrap();
