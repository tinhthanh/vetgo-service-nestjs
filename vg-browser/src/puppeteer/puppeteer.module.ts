import { Module } from '@nestjs/common';
import { PuppeteerService } from './service/puppeteer.service';
import { GoogleLenController } from './controller/google-orc.controler';

@Module({
  imports: [],
  controllers: [GoogleLenController],
  providers: [PuppeteerService],
})
export class PuppeteerModule {}
