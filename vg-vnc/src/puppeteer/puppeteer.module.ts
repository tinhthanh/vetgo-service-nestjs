import { Module } from '@nestjs/common';
import { PuppeteerController } from './controller/puppeteer.controller';
import { PuppeteerService } from './service/puppeteer.service';
import { GptController } from './controller/gpt.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { SocialSignInService } from './service/social-sign-in/social-sign-in.service';
import { GoogleLoginService } from './service/provider/google-login/google-login.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 1,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 3
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 15
      }
    ])
  ],
  controllers: [PuppeteerController, GptController],
  providers: [PuppeteerService, SocialSignInService, GoogleLoginService],
})
export class PuppeteerModule {}
