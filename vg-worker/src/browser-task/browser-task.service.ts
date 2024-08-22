import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BrowserTaskEnum } from './browser-task.enum';

@Injectable()
export class BrowserTaskService {
  constructor(
    @InjectQueue(BrowserTaskEnum.name)
    private readonly queue: Queue,
  ) {}
  async pushTask(task: any) {
    return await this.queue.add('login', task);
  }
}
