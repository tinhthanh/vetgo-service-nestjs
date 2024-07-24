import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as Joi from 'joi';
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
      load: [],
      cache: true, // <== Ở đây
      expandVariables: true, // <== Ở đây ${} // nối các biết lại
      validationOptions: {
        abortEarly: false,
      },
    }),
    SyncFirebaseModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
