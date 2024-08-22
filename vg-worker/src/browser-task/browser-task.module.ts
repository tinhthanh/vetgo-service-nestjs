import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BrowserTaskEnum } from './browser-task.enum';
import { BrowserTaskListener } from './browser-task.listener';
import { BrowserTaskService } from './browser-task.service';
import { BrowserTaskProcessor } from './browser-task.processor';
import { BrowserTaskController } from './browser-task.controller';

@Module({
    controllers: [BrowserTaskController],
    imports: [
        BullModule.registerQueue({
			name: BrowserTaskEnum.name,
            prefix: 'excute-task'
		})
    ],
    providers: [BrowserTaskProcessor,BrowserTaskListener, BrowserTaskService]
})
export class BrowserTaskModule {}
