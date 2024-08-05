import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SyncService } from './sync/sync.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // add middleware validate dữ liệu gửi lên controller
  console.log(process.env.NODE_ENV);
  const config = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  console.log(config.get('PORT'));
  const appService = app.get(SyncService);
  // await appService.syncData();
  await app.listen(config.get('PORT'));
}
bootstrap();
