import { RxStomp } from './stomp/rx-stomp';
import {IMessage }from '@stomp/stompjs';
import { delay, mergeMap, Observable, of, retry, Subject, Subscription, take, tap, throwError } from 'rxjs';
import SockJS from 'sockjs-client';
// import * as SockJS from 'sockjs-client';

import { RxStompConfig } from './stomp/rx-stomp-config';
import { RxStompState } from './stomp/rx-stomp-state';
export class VgWsService {
  private readonly prefix = '/topic/messages';
  private rxStomp!: RxStomp;
  private topicPool: Map<string, Subject<IMessage>> = new Map<string, Subject<IMessage>>();
  public connect(url: string): RxStomp {
    if (this.rxStomp) {
      return this.rxStomp;
    }
    const stompConfig: RxStompConfig = {
      webSocketFactory: () => new SockJS(url),
      debug: (str) => console.log(new Date(), str),

      reconnectDelay: 200,
      heartbeatIncoming: 1000,
      heartbeatOutgoing: 20000,
      logRawCommunication: true,
      beforeConnect: async (client: RxStomp) => {
        console.log('Preparing to connect...');
        // Ví dụ: Lấy token từ dịch vụ khác
      }
      // Đảm bảo client liên tục thử lại
    };
    this.rxStomp = new RxStomp();
    this.rxStomp.configure(stompConfig);
    this.rxStomp.activate();
    return this.rxStomp;
  }
  public gerRxStomp() {
    return this.rxStomp;
  }
  public deleteSubscription(realm: string): void {
    const destination = `${this.prefix}/${realm}`;
    const subject = this.topicPool.get(destination);
    if (subject) {
      subject.complete();
      this.topicPool.delete(realm);
    }
  }
  public register<T>(realm: string, func: (value: T) => void): Subscription {
    const destination = `${this.prefix}/${realm}`;
    return this.registerSubscription(destination, func);
  }

  public tableChange<T>(realm: string ,func: (value : T[] ) => void , table?: string ): Subscription {
    const destination = `${this.prefix}/${realm}`;
    const fc = (value: { message: string }) => {
      if(value.message) {
        try {
          const payload: {data: T[], table: string } = JSON.parse(value.message);
           if(table === payload.table || table === undefined) {
             func(payload.data || []);
           }
        } catch (e) {
          console.error('Error parsing message body', e);
        }
      }
    };
    return this.registerSubscription(destination, fc);
  }

  public disconnect() {
    if (this.rxStomp) {
      this.rxStomp.deactivate();
    }
  }

  public sendMessage<T>(realm: string, body: T): Observable<boolean> {
    return of(null).pipe(
      mergeMap(() => this.checkClientConnection()),
      retry({
        delay: (error, retryCount) => this.handleRetry(error, retryCount),
      }),
      take(1),
      tap(() => this.publishMessage(realm, body))
    );
  }

  private checkClientConnection(): Observable<boolean> {
    if (this.rxStomp.connectionState$.value !== RxStompState.OPEN || !this.rxStomp) {
      console.log('Connect error, will retry....');
      return throwError(() => 'Error!');
    }
    return of(true);
  }

  private handleRetry(error: any, retryCount: number): Observable<any> {
    if (retryCount < 10) {
      console.log(`Retry attempt: ${retryCount}`);
      return of(error).pipe(delay(1000)); // Chờ 1 giây trước khi retry
    }
    console.log(`Retry failed after ${retryCount} attempts.`);
    return throwError(() => error); // Throw error sau khi hết retry attempts
  }

  private publishMessage<T>(realm: string, body: T): void {
    console.log('Send done....');
    const destination = `${this.prefix}/${realm}`;
    this.rxStomp.publish({ destination, body: JSON.stringify(body) });
  }

  private registerSubscription<T>(realm: string, func: (value: T) => void): Subscription {
    let subject = this.topicPool.get(realm);
    if (!subject) {
      subject = new Subject<IMessage>();
      this.topicPool.set(realm, subject);

      this.rxStomp.watch({ destination: realm}).subscribe((message: IMessage) => {
        subject?.next(message);
      });
    }
    return subject.subscribe((message: IMessage) => {
      try {
        func(JSON.parse(message.body) as T);
      } catch (e) {
        console.error('Error parsing message body', e);
      }
    });
  }
}
