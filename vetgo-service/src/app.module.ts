import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { BullModule } from '@nestjs/bullmq';
import { ZaloModule } from './domain/zalo/zalo.module';
import { OrderModule } from './order/order.module';
import { database_config } from './configs/configuration.config';
import { FvetModule } from './modules/fvet/fvet.module';

// đăng ký job chạy
const JOB_REGISTRY = [ZaloModule];
// đăng ký CRUD
const CRUD = [OrderModule];
const TOOLS = [FvetModule];

import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncFirebaseModule } from './modules/sync-firebase/sync-firebase.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision', 'staging')
          .default('development'),
        PORT: Joi.number().default(3000),
      }),
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
      load: [database_config],
      cache: true, // <== Ở đây
      expandVariables: true, // <== Ở đây ${} // nối các biết lại
      validationOptions: {
        abortEarly: false,
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DATABASE_URL'),
        dbName: configService.get<string>('MONGO_DATABASE_NAME'),
      }),
      inject: [ConfigService],
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
    ...TOOLS,
    SyncFirebaseModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
