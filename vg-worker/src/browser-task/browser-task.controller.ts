import { Controller, Get } from '@nestjs/common';
import { BrowserTaskService } from './browser-task.service';
@Controller('task')
export class BrowserTaskController {
  constructor(private readonly browserTaskService: BrowserTaskService) {}
  @Get('login')
  pushTask() {
    return this.browserTaskService.pushTask({ data: 'demo' });
  }
}
