import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, MessagePattern, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { forkJoin } from 'rxjs';
import { VgWebSocketService } from './ws/vg-websocket.service';

@Controller()
export class AppController extends VgWebSocketService  {
  private client: ClientProxy;
  constructor(private configService: ConfigService) { // Inject ConfigService
    super();
    // Lấy các biến môi trường từ ConfigService
    const amqpUrl = this.configService.get<string>('AMQP_URL');
    const queueName = this.configService.get<string>('QUEUE_NAME_CONSUMER');
    const url = this.configService.get<string>('WS');
    this.connect(`${url}/ws`);
    this.register("browser-task", async (data: { message: string }) => {
        console.log(data);
     });
    // Tạo client để gửi message đến consumer với cấu hình từ biến môi trường
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [amqpUrl],
        queue: queueName,
        queueOptions: {
          durable: false,
        },
      },
    });
  }
  @MessagePattern('message_pattern')
  handleMessage(data: any): any {
    console.log(data);
    const pendingOperations = Array.from(new Array(5)).map((_, index) =>
      this.client.send('message_pattern', {
        message: "Hello "+ index,
      }),
    );

    forkJoin(pendingOperations).subscribe();
   return {done: true}
    // console.log('producer Received message:', data);
    // console.log('send to -> consumer');
    // return this.client.send('message_pattern', { text: 'Hello from Producer!' });
  }

}
