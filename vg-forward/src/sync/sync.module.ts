import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import {FileDownloadService } from './file-download.service';

@Module({
  providers: [SyncService, FileDownloadService],
  exports: [SyncService],
})
export class SyncModule {}
