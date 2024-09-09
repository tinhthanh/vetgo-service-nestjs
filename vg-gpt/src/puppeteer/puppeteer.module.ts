import { Module } from '@nestjs/common';
import { PuppeteerController } from './controller/puppeteer.controller';
import { PuppeteerService } from './service/puppeteer.service';
import { GptController } from './controller/gpt.controller';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short', // 5 request trong 20 giay
        ttl: 20000,
        limit: 5,
      },
      // {
      //   name: 'medium',
      //   ttl: 10000,
      //   limit: 3
      // },
      // {
      //   name: 'long',
      //   ttl: 60000,
      //   limit: 15
      // }
    ])
  ],
  controllers: [PuppeteerController, GptController],
  providers: [PuppeteerService],
})
export class PuppeteerModule {}
