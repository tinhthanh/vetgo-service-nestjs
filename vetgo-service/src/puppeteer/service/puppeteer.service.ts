import { Injectable } from '@nestjs/common';
import * as puppeteer2 from 'puppeteer';
// import * as puppeteer from 'puppeteer-extra';
const puppeteer = require('puppeteer-extra');
// import * as StealthPlugin from 'puppeteer-extra-plugin-stealth';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const path = require('path');

@Injectable()
export class PuppeteerService {
  async closeAllBrowsers() {
    await Promise.all([...this.profiles.values()].map((it) => it.close()));
  }
  private profiles: Map<string, puppeteer2.Browser> = new Map();

  public async openOnlyUrl(profileId: string, url: string): Promise<void> {
    const browser = await this.getChromeDriver(profileId);
    const pages = await browser.pages();
    let flatFinded = false; // cờ này để kiểm tra tìm được chưa
    for (const page of pages) {
      try {
        const currentUrl = await page.url();
        if (currentUrl.includes(url)) {
          console.log('moi tab cu len');
          await this.screemDefault(page);
          await page.bringToFront();

          flatFinded = true;
        } else {
          console.log('dong tab' + page.url());
          await page.close();
        }
      } catch (error) {
        await page.close();
      }
    }
    if (!flatFinded) {
      console.log('Khong tim thay tab -> mo moi' + url);
      await this.openUrl(browser, url);
    }
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
  private async getChromeDriver(
    userProfileId: string,
  ): Promise<puppeteer2.Browser> {
    if (this.profiles.has(userProfileId)) {
      console.log('Tra ve profile cu' + userProfileId);
      return this.profiles.get(userProfileId);
    }
    const profileUrl = `browser-profile/${userProfileId}`;
    const profilePath = `${profileUrl}`;
    const pathToExtension = 'browser-plugin';
    const profilePath1 = `file://${__dirname}/${profileUrl}`;
    console.log(profilePath1);
    const customOptions = [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      `--user-data-dir=${profilePath}`,
      '--remote-allow-origins=*',
      '--disable-blink-features=AutomationControlled',
      '--excludeSwitches=enable-automation',
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      `useAutomationExtension=false`,
      '--disable-infobars',
      '--start-maximized',
      '--disable-setuid-sandbox',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
    ];
    const chromeOption = {
      headless: false,
      args: customOptions,
      ignoreDefaultArgs: ['--enable-automation'],
      userDataDir: `browser-cache/${userProfileId}` // change lại mấy cái static page
    };
    const browser = await puppeteer.launch(chromeOption);
    this.profiles.set(userProfileId, browser);
    const backgroundPageTarget = await browser.waitForTarget(
      (target) => target.type() === 'background_page',
    );
    const backgroundPage = await backgroundPageTarget.page();
    console.log(backgroundPage.url());
    console.log('Tao profile moi ' + userProfileId);
    return this.profiles.get(userProfileId);
  }
  // mở một tab url
  private async openUrl(
    browser: puppeteer2.Browser,
    url: string,
  ): Promise<void> {
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

    const blankPage = await browser.newPage();
    await blankPage.goto('about:blank');
  
    // Truy cập trang web cần vượt qua Cloudflare từ tab blank
    await blankPage.goto(url, {
      waitUntil: 'networkidle2', // Đợi cho đến khi không còn kết nối mạng nào đang hoạt động
      timeout: 0 // Tăng thời gian chờ để xử lý Cloudflare
    });
  
    // Chuyển điều khiển sang tab blank
    await blankPage.bringToFront();
    
    // await page1.goto(url,{ waitUntil: 'networkidle2', timeout: 0 });
    // await page1.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    // await page1.setExtraHTTPHeaders({
    //   'accept-language': 'en-US,en;q=0.9',
    //   'accept-encoding': 'gzip, deflate, br'
    // });
    // await page1.goto('https://google.com'); 
  // const targetUrl = url;
  // Tạo và thêm liên kết vào trang, sau đó nhấp vào liên kết
  // await page1.evaluate((url) => {
  //   const iframe = document.createElement('iframe');
  //   iframe.src = url;
  //   iframe.style.width = '100%'; 
  //   iframe.style.height = '100%';
  //   document.body.appendChild(iframe);
  // }, targetUrl);
  }
  // lấy hết url đang mở
  private async currentTabs(browser: puppeteer2.Browser): Promise<string[]> {
    const pages = await browser.pages();
    const openUrls = [];
    for (const page of pages) {
      const url = await page.url();
      openUrls.push(url);
    }
    return openUrls;
  }
}

// tôí ưu trog lúc cào data
const minimal_args = [
  '--disable-speech-api', // 	Disables the Web Speech API (both speech recognition and synthesis)
  '--disable-background-networking', // Disable several subsystems which run network requests in the background. This is for use 									  // when doing network performance testing to avoid noise in the measurements. ↪
  '--disable-background-timer-throttling', // Disable task throttling of timer tasks from background pages. ↪
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];