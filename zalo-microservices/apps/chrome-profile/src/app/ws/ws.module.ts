import { Module } from '@nestjs/common';
import { VgWsService } from './vg-websocket.service';

@Module({
  controllers: [],
  providers: [VgWsService],
  exports: [VgWsService],
})
export class WsModule {}
