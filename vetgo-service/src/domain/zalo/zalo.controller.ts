import { Controller, Get } from '@nestjs/common';
import {  ZaloService } from './zalo.service';
@Controller('zalo')
export class ZaloController {
  constructor(private readonly zaloService: ZaloService) {

  }
  @Get('login')
  pushTask() {
    return this.zaloService.pushTask({ data: 'demo' });
  }
}
