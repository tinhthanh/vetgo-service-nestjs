import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LangchainService } from './services/langchain.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, LangchainService],
})
export class AppModule {}
