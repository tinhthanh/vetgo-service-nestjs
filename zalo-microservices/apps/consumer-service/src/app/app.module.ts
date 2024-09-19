import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision', 'staging')
          .default('development'),
        PORT: Joi.number(),
        HEADLESS: Joi.boolean().default(false),
        AMQP_URL: Joi.string().required(),
        QUEUE_NAME_PRODUCER: Joi.string().required(),
        QUEUE_NAME_CONSUMER: Joi.string().required(),
        WS: Joi.string().required()
      }),
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '../.env.dev' : '../.env',
      cache: true, // <== Ở đây
      expandVariables: true, // <== Ở đây ${} // nối các biết lại
      validationOptions: {
        abortEarly: false,
      }
    })
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
