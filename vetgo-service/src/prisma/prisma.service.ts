import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          // url: "postgresql://vetgo:Thanh71311@@localhost:5434/vetgo?schema=public",
          url: configService.get('DATABASE_URL'),
        },
      },
    });
    console.log('configService : ' + configService.get('DATABASE_URL'));
  }
}
