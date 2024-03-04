import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QueueName } from './enum';
import { ZaloController } from './zalo.controller';
import { ZaloListener } from './zalo-listener.job';
import { ZaloProcessor } from './zalo.processor';
import { ZaloService } from './zalo.service';

@Module({
  controllers: [ZaloController],
  providers: [ZaloService, ZaloProcessor, ZaloListener],
  imports: [
    BullModule.registerQueue({
      name: QueueName.zalo,
      prefix: 'vetgo',
    }),
  ],
})
export class ZaloModule {}
