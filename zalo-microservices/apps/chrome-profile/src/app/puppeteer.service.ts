import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer2 from 'puppeteer';
// import * as puppeteer from 'puppeteer-extra';
const puppeteer = require('puppeteer-extra');
// import * as StealthPlugin from 'puppeteer-extra-plugin-stealth';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
import { Mutex } from 'async-mutex';
import { debounceTime, Subject } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import * as path from 'path';
import { ActionModel, PasteImageData, SendKeyData } from './action.dtb';
const fs = require('fs').promises;
import * as fs2 from 'fs';
@Injectable()
export class PuppeteerService implements OnModuleDestroy {
  private profiles: Map<string, puppeteer2.Browser> = new Map();
  private browserPositions: Array<{ x: number, y: number }> = [];
  private mutex = new Mutex(); // hỗ trợ nhiều request vào đồng thời
  private $closeBrowser = new Subject<string>();
  constructor(private readonly configService: ConfigService) {
    console.log('PuppeteerService init')
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
  getProfiles(): Map<string, puppeteer2.Browser> {
    return this.profiles;
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
  // kiểm tra url đang mở
  public async hasOpenUrl(profileId: string, url: string): Promise<boolean> {
    const browser = await this.getChromeDriver(profileId);
    const pages = await browser.pages();
    for (const page of pages) {
        const currentUrl = await page.url();
        if (currentUrl.includes(url)) {
           return true;
        }
    }
    return false;
  }
  public async openOnlyUrl(profileId: string, url: string): Promise<puppeteer2.Page> {
    const browser = await this.getChromeDriver(profileId);
    const pages = await browser.pages();
    for (const page of pages) {
      try {
        const currentUrl = await page.url();
        if (currentUrl.includes(url)) {
          console.log('moi tab cu len');
          await this.screemDefault(page);
          await page.bringToFront();
          return page;
        } else {
          console.log('dong tab' + page.url());
          await page.close();
        }
      } catch (error) {
        await page.close();
      }
    }
    console.log('Khong tim thay tab -> mo moi' + url);
    return this.openUrl(browser, url,profileId);
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
  public async simulateDragAndDrop(
    profileId: string,
    url: string,
    selector: string,
    pathImg: string
  ) {
    const browser = await this.getChromeDriver(profileId);
    const pages = await browser.pages();
    for (const page of pages) {
      const currentUrl = await page.url();
      if (currentUrl.includes(url)) {
        await this.screemDefault(page);
        await page.bringToFront();
        const imageBuffer = await this.downloadImage(pathImg);
        const [fileChooser] = await Promise.all([
          page.waitForFileChooser(),
          page.click('[data-translate-title="STR_SEND_PHOTO"]'), // some button that triggers file selection
        ]);

        const tempFilePath = path.join(__dirname, `${profileId}-temp-image.png`);
        if (fs2.existsSync(tempFilePath)) {
              fs2.unlinkSync(tempFilePath);
            console.log('Deleted temporary file:', tempFilePath);
         }
        fs2.writeFileSync(tempFilePath, imageBuffer);

        await fileChooser.accept([tempFilePath]);


        return; // cách 2 kéo thả
        const response = await fetch(pathImg);
        const arrayBuffer = await response.arrayBuffer(); // Lấy dữ liệu dưới dạng ArrayBuffer
        const base64Img = Buffer.from(arrayBuffer).toString('base64'); // Chuyển đổi thành base64


        const data = await fetch(pathImg);
        const blobFile = await data.blob();
        console.log(blobFile);



        // Bước 2: Sao chép hình ảnh vào clipboard
        await page.evaluate(async (base64Img,selector) => {
           // Chuyển đổi base64 thành Blob
        const byteCharacters = atob(base64Img);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blobFile = new Blob([byteArray], { type: 'image/png' }); // Tạo Blob từ byte array

        // Tạo đối tượng File từ Blob
          const file = new File([blobFile], 'image.png', { type: 'image/png' });

          // Mô phỏng sự kiện DragEvent và thêm file vào DataTransfer
          const eventDrop = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          });
          eventDrop.dataTransfer.items.add(file);
          // Thực hiện thao tác drop trên vùng chỉ định (dropSelector)
          const dropZone = document.querySelector(selector);
          if (dropZone) {
            dropZone.dispatchEvent(eventDrop);
            console.log('File dropped successfully!');
          } else {
            console.error('Drop zone not found!');
          }
        }, base64Img,selector);
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
      // const pathToExtension = 'browser-plugin';
      const customOptions = [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        `--user-data-dir=${profilePath}`,
        '--remote-allow-origins=*',
        '--disable-blink-features=AutomationControlled',
        '--excludeSwitches=enable-automation',
        // `--disable-extensions-except=${pathToExtension}`,
        // `--load-extension=${pathToExtension}`,
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
     })

  }

  // mở một tab url
  private async openUrl(
    browser: puppeteer2.Browser,
    url: string,
    phone: string
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

    const addScriptToPage = async (script, scriptId) => {
      await blankPage.evaluate((script, scriptId) => {
        if (!document.getElementById(scriptId)) {
          const scriptElement = document.createElement('script');
          scriptElement.textContent = script;
          scriptElement.id = scriptId;
          document.head.appendChild(scriptElement);
        } else {
          console.log('Script with id already exists:');
        }
      }, script,scriptId);
    };

    // Sử dụng sự kiện framenavigated để thêm script theo domain
    blankPage.on('framenavigated', async () => {
    const url = new URL(blankPage.url()); // Lấy URL hiện tại
    const domain = url.hostname; // Lấy domain
    console.log('Navigated to domain:', domain);
    // add common common-func.js
    const scriptPath = path.join(__dirname, 'assets', 'scripts', 'common-func.js');
    const scriptContent = await fs.readFile(scriptPath, 'utf8');
    await blankPage.evaluate((phone) => {
      sessionStorage.setItem('phone', phone);
    }, phone);
    // Kiểm tra xem window.sendActionType đã tồn tại chưa
  const isFuncExposed = await blankPage.evaluate(() => {
    return typeof window['sendActionType'] !== 'undefined';
  });
  if(!isFuncExposed) {
    await blankPage.exposeFunction('sendActionType', async (data: ActionModel) => {
      if (data?.actionType === 'SEND_KEY') {
        console.log('Received message from page:', data);
        // Trả về một giá trị sau khi xử lý xong
        const dataSendKey = data.data  as SendKeyData;
         await this.sendKey(
          data.phone,
          data.url,
          dataSendKey.selector,
          dataSendKey.value,
          dataSendKey?.delay || 50,
        );
        if(dataSendKey.isEnter) {
          await this.pressKey(
            data.phone,
            data.url,
            dataSendKey.selector,
            'Enter'
          )
        }
        console.log('excute task done')
      }
      if (data?.actionType === 'PASTE_IMAGE') {
        console.log('Received message from page:', data);
        const dataInput = data.data  as PasteImageData;
        await this.simulateDragAndDrop(
          data.phone,
          data.url,
          dataInput.selector,
          dataInput.url
        );
        console.log('excute task donee')
      }
      // thông báo về client đã làm xog task
      await blankPage.evaluate(() => {
        const responseEvent = new CustomEvent('RESPONSE_FROM_SERVER', {
          detail: { status: 'DONE' }
        });
        document.querySelector('body').dispatchEvent(responseEvent);
      });
    });
  }
     await addScriptToPage(scriptContent, 'commonFuncJs');
    // if (domain === 'id.zalo.me') {
    //   await addScriptToPage(`console.warn('helo1')`); // Thêm script cho example.com
    // } else if (domain === 'chat.zalo.me') {
    //   await addScriptToPage(`console.warn('helo2')`); // Thêm script cho another-example.com
    // } else {
    //   console.log('No specific script for this domain');
    // }
  });

    await blankPage.goto(url, {
      waitUntil: 'networkidle2', // Đợi cho đến khi không còn kết nối mạng nào đang hoạt động
      timeout: 0 // Tăng thời gian chờ để xử lý Cloudflare
    });
  // Inject mã JavaScript để tạo "BrowserSignature"
  const browserSignature = await blankPage.evaluate(() => {
    // Mã "BrowserSignature" được inject vào trang
    function getBrowserSignature(conf) {
      const config = conf || {}
      const kit = config.kit || globalThis.window;
      const hash = config.hash || getBrowserSignature.hash;
      if(kit == null) throw new Error("No provided kit");
      const n = kit.navigator;
      const s = kit.screen;

      function getKey(i) {
        let pointer = kit;
        i.split(".").forEach(k => {
          pointer = pointer[k];
        });
        return pointer;
      }

      let sw = [n.appName, n.appCodeName, n.product, n.productSub, n.vendor];
      if (Array.isArray(config.software)) {
        if (config.override == true) {
          sw = config.software;
        } else {
          sw = sw.concat(config.software.map(i => getKey(i)));
        }
      }

      let hw = [s.availHeight, s.availWidth, s.pixelDepth, s.colorDepth, n.hardwareConcurrency, n.maxTouchPoints, kit.devicePixelRatio];
      if (Array.isArray(config.hardware)) {
        if (config.override == true) {
          hw = config.hardware;
        } else {
          hw = hw.concat(config.hardware.map(i => getKey(i)));
        }
      }

      let comp = ["WebGL2RenderingContext", "Worker", "WebSocket", "WebAssembly", "RTCCertificate", "IDBDatabase"];
      if (Array.isArray(config.compatibility)) {
        if (config.override == true) {
          comp = config.compatibility;
        } else {
          comp = comp.concat(config.compatibility.map(i => getKey(i)));
        }
      }

      const sign = {
        software: hash(sw.join("")),
        hardware: hash(hw.join("")),
        compatibility: hash(comp.map(i => i in kit ? 1 : 0).join(""))
      };

      sign['signature'] = {
        all: hash(sign.software + sign.hardware + sign.compatibility),
        softhard: hash(sign.software + sign.hardware),
        hardcomp: hash(sign.hardware + sign.compatibility),
        softcomp: hash(sign.software + sign.compatibility)
      };

      return sign;
    }

    getBrowserSignature.hash = (raw) => {
      function hash(str) {
        let h1 = 0xdeadbeef ^ 0;
        let h2 = 0x41c6ce57 ^ 0;
        for (let i = 0; i < str.length; i++) {
          var ch = str.charCodeAt(i);
          h1 = Math.imul(h1 ^ ch, 2654435761);
          h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
        h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
        h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
      }

      function pair(a, b) {
        return 0.5 * (a + b) * (a + b + 1) + b;
      }

      return hash(new Array(Math.ceil(raw.length / 2)).fill(0).map((_, i) => {
        return pair(raw.charCodeAt(i * 2), raw.charCodeAt(i * 2 + 1) || 0);
      }).join("")).toString(16);
    };

    getBrowserSignature.version = 3;

    // Trả về kết quả của hàm tạo chữ ký trình duyệt
    return getBrowserSignature({});
  });

    console.log(browserSignature); // In ra "BrowserSignature"
    this.screemDefault(blankPage);
    return blankPage;
  }
  async downloadImage(imageUrl: string): Promise<Buffer> {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }


}
