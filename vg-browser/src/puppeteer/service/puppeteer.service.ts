import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer2 from 'puppeteer';
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import { Mutex } from 'async-mutex';
import { debounceTime, Subject } from 'rxjs';
import { ConfigService } from '@nestjs/config';

puppeteer.use(StealthPlugin());

@Injectable()
export class PuppeteerService implements OnModuleDestroy {
  private profiles: Map<string, puppeteer2.Browser> = new Map();
  private browserPositions: Array<{ x: number, y: number }> = [];
  private mutex = new Mutex(); // hỗ trợ nhiều request vào đồng thời
  private $closeBrowser = new Subject<string>();

  constructor(private readonly configService: ConfigService) {
    const offsetX = 640; // Chiều rộng của cửa sổ trình duyệt
    const offsetY = 480; // Chiều cao của cửa sổ trình duyệt
    const maxWidth = 1920; // Chiều rộng tối đa của màn hình
    const maxHeight = 1080; // Chiều cao tối đa của màn hình

    for (let y = 0; y < maxHeight; y += offsetY) {
      for (let x = 0; x < maxWidth; x += offsetX) {
        this.browserPositions.push({ x, y });
      }
    }
    // 1p k ai dung thi tat trinh duyet
    this.$closeBrowser.pipe(debounceTime(1*60*1000)).subscribe( () => {
       this.closeAllBrowsers();
    });
  }
  onModuleDestroy() {
    this.closeAllBrowsers();
  }

  async closeAllBrowsers() {
    console.log('Close alll');
    for( let [ key , value ] of this.profiles) {
      await this.mutex.runExclusive(async () => {
        value.close().then(() => {
          this.profiles.delete(key);
        }).catch(()=> {
          console.log(`Không thể tắt được ${key}`);
          });
       });
    }
  }

  async getChromeDriver(userProfileId: string): Promise<puppeteer2.Browser> {
    this.$closeBrowser.next(userProfileId);
    // Lock the mutex to ensure thread safety
    return await this.mutex.runExclusive(async () => {
      if (this.profiles.has(userProfileId)) {
        console.log('Returning existing profile after acquiring lock ' + userProfileId);
        return this.profiles.get(userProfileId);
      }
      const profileUrl = `browser-profile/${userProfileId}`;
      const profilePath = `${profileUrl}`;

      const positionIndex = this.profiles.size % this.browserPositions.length;
      const windowPosition = this.browserPositions[positionIndex];

      const customOptions = [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        `--user-data-dir=${profilePath}`,
        '--remote-allow-origins=*',
        '--disable-blink-features=AutomationControlled',
        '--excludeSwitches=enable-automation',
        // 'useAutomationExtension=false',
        `--window-position=${windowPosition.x},${windowPosition.y}`,
        `--window-size=640,480`, // Đảm bảo cửa sổ có kích thước nhất định
        '--disable-gpu', 
        '--disable-setuid-sandbox'
      ];

      const chromeOption = {
        headless:  this.configService.get('HEADLESS'),
        args: customOptions,
        ignoreDefaultArgs: ['--enable-automation'],
      };

      try {
        const browser = await puppeteer.launch(chromeOption);
        this.profiles.set(userProfileId, browser);
        console.log('Created new profile ' + userProfileId);
        return browser;
      } catch (error) {
        console.error('Failed to launch browser:', error);
        throw error;
      }
    });
  }
}
