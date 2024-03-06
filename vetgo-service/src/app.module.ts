import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { BullModule } from '@nestjs/bullmq';
import { ZaloModule } from './domain/zalo/zalo.module';
import { OrderModule } from './order/order.module';
const JOB_REGISTRY = [ZaloModule];
const CRUD = [OrderModule];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    UserModule,
    AuthModule,
    PrismaModule,
    PuppeteerModule,
    ...JOB_REGISTRY,
    ...CRUD,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
