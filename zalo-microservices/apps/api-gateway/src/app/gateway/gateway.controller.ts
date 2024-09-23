import { Body, Controller, Get, Post, Sse } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { BehaviorSubject, Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { ActionType, TaskLoginZlModel, TaskStatusModel } from '@vg/common';
@Controller('gateway')
export class GatewayController {
private client: ClientProxy; // Khai báo biến client là thành viên của class
// phone | task id - message
private readonly sessions: Map<string, BehaviorSubject<MessageEvent>> = new Map();
constructor(private configService: ConfigService) {
  // Lấy các biến môi trường từ ConfigService
  const amqpUrl = this.configService.get<string>('AMQP_URL'); // URL của RabbitMQ
  const queueName = this.configService.get<string>('QUEUE_NAME_CONSUMER'); // Tên queue của consumer
  // Tạo ClientProxy sử dụng RabbitMQ với các cấu hình từ biến môi trường
  this.client = ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [amqpUrl], // URL của RabbitMQ
      queue: queueName, // Tên queue của consumer
      queueOptions: {
        durable: false, // Queue không bền vững (không lưu lại khi RabbitMQ restart)
      },
    },
  });
}
@Post('login-zl')
@Sse()
loginZl(@Body() data: { phone: string }): Observable<MessageEvent> {
  const sessionId = data.phone;
  if(this.sessions.has(sessionId)) {
    return this.sessions.get(sessionId);
  } else {
    const sessionSubject = new BehaviorSubject<MessageEvent>({ data: null });
    this.sessions.set(sessionId, sessionSubject);
    return new Observable<MessageEvent>((ob) => {
      sessionSubject.subscribe(ob);

      const task: TaskLoginZlModel = {
        actionType: ActionType.LOGIN,
        phone: data.phone,
        data: {}
      };
      this.client
      .send(task.actionType,task ).subscribe( {
        next: (rs) => {
          console.warn('DONE' , rs);
          sessionSubject.next({data: rs});
          sessionSubject.complete();
          this.sessions.delete(sessionId);
        },
        error: (error) => {
          console.warn('ERROR' , error);
          sessionSubject.complete();
          this.sessions.delete(sessionId);
        }
      });
    });
  }
}
// hàm này nhận trạng thái process của task ,vd như login , task draw dữ liệu
@MessagePattern('status_task')
public async execute(@Payload() data: TaskStatusModel) {
  console.log('status task' , data);
  if(this.sessions.has(data.id)) {
    const sessionSubject = this.sessions.get(data.id);
    sessionSubject.next({data: data.data});
  }
  return data;
}
}
