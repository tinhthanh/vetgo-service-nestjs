import { Module } from '@nestjs/common';
import { VgWebSocketService } from './vg-websocket.service';

@Module({
  controllers: [],
  providers: [VgWebSocketService],
  exports: [VgWebSocketService],
})
export class VgVsModule {}
