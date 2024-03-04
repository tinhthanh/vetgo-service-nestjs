import {
  OnQueueEvent,
  QueueEventsHost,
  QueueEventsListener,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueName } from './enum';
// Local event listeners
@QueueEventsListener(QueueName.zalo)
export class ZaloListener extends QueueEventsHost {
  private logger = new Logger(ZaloListener.name);
  @OnQueueEvent('active')
  onQueueEventActive(job: any) {
    this.logger.log(`Job has been started!`);
    this.logger.log(job);
  }

  @OnQueueEvent('completed')
  onQueueEventCompleted(job: Job, result: any) {
    this.logger.log(`Job has been completed!!`);
  }

  @OnQueueEvent('failed')
  onQueueEventFailed(job: Job, err: any) {
    this.logger.log(`Job has been failed: ${job.id}`);
    this.logger.log(err);
  }

  @OnQueueEvent('error')
  onQueueEventError(err: any) {
    this.logger.log(`Job has got error: `);
    this.logger.log(err);
  }
}
