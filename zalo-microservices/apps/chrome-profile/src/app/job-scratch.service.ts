import { Injectable } from "@nestjs/common";
import { PuppeteerService } from "./puppeteer.service";
import { interval } from "rxjs";
import * as path from 'path';
const fs = require('fs').promises;
@Injectable()
export class JobScratchService {
  constructor(private readonly puppeteerService: PuppeteerService) {
    // 30 giay cao mot lan
    interval(30*1000).subscribe( async () => {
      const list = this.puppeteerService.getProfiles();
       console.log('Job cào data run');
      for(let [key , p] of list ) {
         const pages = await p.pages();
         for (const page of pages) {
          const url = await page.url();
           if(url.startsWith('https://chat.zalo.me')) {
              console.log('Page đang mở là zalo');
              const scriptPath = path.join(__dirname, 'assets', 'scripts', 'get-list-message.js');

              const scriptContent = await fs.readFile(scriptPath, 'utf8');
                // Thực thi mã JavaScript từ file script.js trên trang web
                const result = await page.evaluate(scriptContent);

                console.log('Result from script:', result);
           }
          }
        }
    });
  }
}
