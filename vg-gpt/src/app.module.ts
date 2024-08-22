import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision', 'staging')
          .default('development'),
        PORT: Joi.number().default(3000),
        HEADLESS: Joi.boolean().default(false)
      }),
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
      cache: true, // <== Ở đây
      expandVariables: true, // <== Ở đây ${} // nối các biết lại
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
