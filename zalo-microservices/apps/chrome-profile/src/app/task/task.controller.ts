import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { VgWsService } from '@vg/ws';
@Controller()
export class TaskController extends VgWsService {
  constructor(private configService: ConfigService) { // Inject ConfigService
    super();
    const url = this.configService.get<string>('WS');
    this.connect(`${url}/ws`);
  }
@MessagePattern('message_pattern')
public async execute(@Payload() data: any, @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMessage = context.getMessage();

  console.log('data', data);
  const clientId = data.clientId;
  await this.mySuperLongProcessOfUser(data, clientId);

  channel.ack(originalMessage);

}
async mySuperLongProcessOfUser(data: any, clientId: string) {
  return new Promise(resolve => {
    let progress = 0;

    const interval = setInterval(() => {
      progress += 10;
      console.log(`Progress: ${progress}%`);

      // Gửi tiến trình qua RabbitMQ
      this.sendProgress(progress, clientId);

      if (progress >= 100) {
        clearInterval(interval);
        console.log(`done processing data: ${JSON.stringify(data)}`);
        resolve(null);
      }
    }, 1000);
  });
}
  sendProgress(progress: number, clientId: string) {
    // send process to websocket
    console.log(progress);
    this.sendMessage('browser-task', {progress, clientId}).subscribe();
  }
}
