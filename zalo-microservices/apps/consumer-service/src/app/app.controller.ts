import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class AppController {
@MessagePattern('message_pattern')
public async execute(@Payload() data: any, @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMessage = context.getMessage();

  console.log('data', data);
  const clientId = data.clientId;
  await this.mySuperLongProcessOfUser(data, clientId);

  channel.ack(originalMessage);
}
// gia lap thoi gian thuc thi task
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
  }
}
