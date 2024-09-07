import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer2 from 'puppeteer';
// import * as puppeteer from 'puppeteer-extra';
const puppeteer = require('puppeteer-extra');
// import * as StealthPlugin from 'puppeteer-extra-plugin-stealth';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const path = require('path');
import { Mutex } from 'async-mutex';
import { Subject } from 'rxjs';
import { ConfigService } from '@nestjs/config';
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
    // this.$closeBrowser.pipe(debounceTime(1*60*1000)).subscribe( () => {
    //    this.closeAllBrowsers();
    // });
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
  public async openOnlyUrl(profileId: string, url: string): Promise<puppeteer2.Page> {
    const browser = await this.getChromeDriver(profileId);
    const pages = await browser.pages();
    pages.forEach( (p, i) => {
      if(i > 0) {
        p.close();
      }
    });
    // for (const page of pages) {
    //   try {
    //     const currentUrl = await page.url();
    //     if (currentUrl.includes(url)) {
    //       console.log('moi tab cu len');
    //       await this.screemDefault(page);
    //       await page.bringToFront();
    //       await page.reload();
    //       return page;
    //     } else {
    //       console.log('dong tab' + page.url());
    //       await page.close();
    //     }
    //   } catch (error) {
    //     await page.close();
    //   }
    // }
    console.log('Khong tim thay tab -> mo moi' + url);
    return this.openUrl(browser, url);
  }
  public async sendKey(
    profileId: string,
    url: string,
    selector: string,
    text: string,
    delay: number,
  ) {
    const browser = await this.getChromeDriver(profileId);
    const pages = await browser.pages();
    for (const page of pages) {
      const currentUrl = await page.url();
      if (currentUrl.includes(url)) {
        await this.screemDefault(page);
        await page.bringToFront();
        await page.type(selector, text, { delay });
      } else {
        console.log('dong tab' + page.url());
        await page.close();
      }
    }
  }
  public async pressKey(
    profileId: string,
    url: string,
    selector: string,
    key: puppeteer2.KeyInput,
  ) {
    const browser = await this.getChromeDriver(profileId);
    const pages = await browser.pages();
    for (const page of pages) {
      const currentUrl = await page.url();
      if (currentUrl.includes(url)) {
        await this.screemDefault(page);
        await page.bringToFront();
        await page.focus(selector);
        await page.keyboard.press(key, { delay: 100 });
      } else {
        console.log('dong tab' + page.url());
        await page.close();
      }
    }
  }
  // set screem
  private async screemDefault(page: puppeteer2.Page): Promise<void> {
    const width = 1280;
    const height = 720;
    await page.setViewport({ width, height });
  }
  // open profile mới
  public async getChromeDriver(
    userProfileId: string,
  ): Promise<puppeteer2.Browser> {
    this.$closeBrowser.next(userProfileId);
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
        // '--disable-dev-shm-usage',
        // `--user-data-dir=${profilePath}`,
        // '--remote-allow-origins=*',
        // '--disable-blink-features=AutomationControlled',
        // '--excludeSwitches=enable-automation',
        // `--window-position=${windowPosition.x},${windowPosition.y}`,
        `--window-size=640,480`, // Đảm bảo cửa sổ có kích thước nhất định
        '--disable-gpu', 
        '--enable-webgl'
        // '--start-fullscreen'
        // '--disable-setuid-sandbox'
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
     })
    
  }

  // mở một tab url
   async openUrl(
    browser: puppeteer2.Browser,
    url: string,
  ): Promise<puppeteer2.Page> {
    const page1 = await browser.newPage();
    // interception
    await page1.setRequestInterception(true); // Câu lệnh này cần gọi 1 lần trước khi gọi page.on('request' ...
    page1.on('request', request => {
      // request là hình ảnh media thì bỏ qua luôn
      if ( (request.resourceType() === 'image') || (request.resourceType() === 'media')  ){
          request.abort();
      }else{
          request.continue();
      }
    });
    // interception
    await this.screemDefault(page1);
    await page1.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
    );
    await page1.evaluateOnNewDocument(() => { // fake vân tay
      // Ghi đè các thuộc tính canvas để làm cho vân tay khác nhau
      const originalCreateElement = document.createElement;
      document.createElement = function (tagName) {
        if (tagName === 'canvas') {
          const canvas = originalCreateElement.call(document, tagName);
          const originalGetContext = canvas.getContext;
          canvas.getContext = function (contextType) {
            if (contextType === '2d') {
              return originalGetContext.call(canvas, contextType, {
                willReadFrequently: true,
              });
            }
            return originalGetContext.call(canvas, contextType);
          };
          return canvas;
        }
        return originalCreateElement.call(document, tagName);
      };
    });
    await page1.evaluateHandle(
      "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})",
    );
    await page1.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    const blankPage = await browser.newPage();
    // TODO nếu bị phát hiện thì fake vân tay
    await blankPage.evaluateHandle(
      "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})",
    );
    await blankPage.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });
    await blankPage.goto('about:blank');
    await blankPage.bringToFront();
    
    await page1.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page1.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.9',
      'accept-encoding': 'gzip, deflate, br'
    });

    await blankPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await blankPage.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.9',
      'accept-encoding': 'gzip, deflate, br'
    });
    
    await blankPage.goto(url, {
      waitUntil: 'networkidle2', // Đợi cho đến khi không còn kết nối mạng nào đang hoạt động
      timeout: 0 // Tăng thời gian chờ để xử lý Cloudflare
    });
    return blankPage;
  }
 
}