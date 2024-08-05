import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileDownloadService {
  private readonly downloadUrl = 'https://github.com/tinhthanh/cdn/archive/refs/heads/main.zip';
  private readonly outputPath = path.resolve(__dirname, '../cdn');

  async downloadAndExtract() {
    const zipFilePath = path.resolve(this.outputPath, 'main.zip');

    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }

    // Tải tệp ZIP
    const response = await axios({
      url: this.downloadUrl,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    fs.writeFileSync(zipFilePath, response.data);

    // Giải nén tệp ZIP
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(this.outputPath, true);

    // Xóa tệp ZIP sau khi giải nén
    fs.unlinkSync(zipFilePath);

    console.log('Download and extraction complete.');
  }
}
