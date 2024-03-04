import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueueName } from './enum';

@Injectable()
export class ZaloService {
 constructor(@InjectQueue(QueueName.zalo)
             private readonly queue: Queue) {
 }
  async pushTask(task: any) {
    return await this.queue.add('login', task);
  }
}
