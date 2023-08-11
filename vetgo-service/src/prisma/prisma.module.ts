import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // this module is use Globally
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
