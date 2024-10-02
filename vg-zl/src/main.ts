import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  const config = app.get(ConfigService);
  console.log(config.get('PORT'));
  console.log(`Consumer chrome profile Service is running`);
  await app.listen(config.get('PORT'));
}

bootstrap();
