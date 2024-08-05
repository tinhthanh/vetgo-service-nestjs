import { Injectable } from '@nestjs/common';
import { FileDownloadService } from './file-download.service';

@Injectable()
export class SyncService  {
  constructor(private fileDownloadService: FileDownloadService) {}
  async syncData() {
    console.log('Syncing data...');
    await this.fileDownloadService.downloadAndExtract();
    // Giả lập việc đồng bộ dữ liệu async
    console.log('Data synced.');
  }
}
