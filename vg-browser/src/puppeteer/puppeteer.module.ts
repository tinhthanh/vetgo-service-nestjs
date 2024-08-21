import { Module } from '@nestjs/common';
import { PuppeteerService } from './service/puppeteer.service';
import { GoogleLenController } from './controller/google-orc.controler';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 5000,  // Thời gian tính theo giây (60 giây)
      limit: 5, // Số lượng request tối đa trong thời gian ttl
    }])
  ],
  controllers: [GoogleLenController],
  providers: [PuppeteerService],
})
export class PuppeteerModule {}
