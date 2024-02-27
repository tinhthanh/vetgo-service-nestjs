import { Module } from '@nestjs/common';
import { PuppeteerController } from './controller/puppeteer.controller';
import { PuppeteerService } from './service/puppeteer.service';

@Module({
  imports: [],
  controllers: [PuppeteerController],
  providers: [PuppeteerService],
})
export class PuppeteerModule {}
