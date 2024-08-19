import { Body, Controller, Get, Post, Sse } from '@nestjs/common';
import { AppService } from './app.service';
import { LangchainService } from './services/langchain.service';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly langchainService: LangchainService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('/ollama')
  @Sse('/stream')
  ollamaStream(@Body() payload: { question: string }): Observable<MessageEvent | string> {
    return new Observable(observer => {
      let rs = '';
      this.langchainService.streamResponse(payload.question, (chunk) => {
        rs += chunk.content;
        // Emit the chunk as a new SSE event
        observer.next({
          data: chunk.content,
        });
        // If the response is done, complete the observable
        if (chunk.response_metadata && chunk.response_metadata.done) {
          console.log('done');
          observer.next(rs);
          observer.complete();
        }
      });
    });
  }

  @Get("translate")
  translate() {
    return this.langchainService.resultFromJsonMode();
  }
  @Get("ocr")
  ocr() {
    return this.langchainService.orc();
  }
  @Get("qdrant")
  qdrant() {
    return this.langchainService.qdrant();
  }
  @Get("qdrant-use")
  qdrantUse() {
    return this.langchainService.useQdrant();
  }
}
