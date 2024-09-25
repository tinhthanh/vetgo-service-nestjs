import { Module } from '@nestjs/common';

import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { PuppeteerService } from './puppeteer.service';
import { JobScratchService } from './job-scratch.service';
import { TaskService } from './task.service';
import { HttpModule } from '@nestjs/axios';
import { PuppeteerController } from './puppeteer.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision', 'staging')
          .default('development'),
        PORT: Joi.number(),
        HEADLESS: Joi.boolean().default(false),
        WS: Joi.string().required()
      }),
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
      cache: true, // <== Ở đây
      expandVariables: true, // <== Ở đây ${} // nối các biết lại
      validationOptions: {
        abortEarly: false,
      }
    }),
    HttpModule
  ],
  controllers: [PuppeteerController],
  providers: [PuppeteerService, JobScratchService, TaskService],
})
export class AppModule {}
