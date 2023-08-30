import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import {AuthModule} from "./auth/auth.module";
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PuppeteerModule } from './puppeteer/puppeteer.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    UserModule,
    AuthModule,
    PrismaModule,
    PuppeteerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
