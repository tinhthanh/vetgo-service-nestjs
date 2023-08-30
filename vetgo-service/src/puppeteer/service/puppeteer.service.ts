import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
const path = require('path');

@Injectable()
export class PuppeteerService {

  async closeAllBrowsers() {
    await Promise.all([...this.profiles.values()].map( it => it.close()));
  }
  private profiles: Map<string,puppeteer.Browser> = new Map();
  
 public async openOnlyUrl(profileId: string ,url: string): Promise<void> {
    const browser = await this.getChromeDriver(profileId);
    const pages = await browser.pages();
    let flatFinded = false; // cờ này để kiểm tra tìm được chưa
   for( const page of pages ) {
    try {
      const currentUrl = await page.url();
      if(currentUrl.includes(url)) {
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
public async sendKey(profileId: string , url: string , selector: string, text: string , delay: number) {
    const browser = await this.getChromeDriver(profileId);
    const pages = await browser.pages();
    for( const page of pages ) {
      const currentUrl = await page.url(); 
      if(currentUrl.includes(url)) { 
        await this.screemDefault(page);
        await page.bringToFront();
        await page.type(selector, text , {delay});
      } else {
        console.log('dong tab' + page.url());
         await page.close();
       }
     }
  }
 public async pressKey(profileId: string , url: string , selector: string, key: puppeteer.KeyInput) {
    const browser = await this.getChromeDriver(profileId);
    const pages = await browser.pages();
    for( const page of pages ) {
      const currentUrl = await page.url(); 
      if(currentUrl.includes(url)) { 
        await this.screemDefault(page);
        await page.bringToFront();
        await page.focus(selector);
        await page.keyboard.press(key, {delay: 100});
      } else {
        console.log('dong tab' + page.url());
         await page.close();
       }
     }
    
  }
  // set screem 
 private async screemDefault(page: puppeteer.Page): Promise<void> {
    const width = 1280;
    const height = 720;
    await page.setViewport({ width, height });
  }
  // open profile mới
  private async  getChromeDriver(userProfileId: string): Promise<puppeteer.Browser>  {
    if (this.profiles.has(userProfileId)) {
      console.log('Tra ve profile cu' + userProfileId);
      return this.profiles.get(userProfileId);
    }
    const profileUrl = `browser-profile/${userProfileId}`;
    const profilePath = `${profileUrl}`;
    const pathToExtension =  'browser-plugin';
    const profilePath1 = `file://${__dirname}/${profileUrl}`;
    console.log(profilePath1);
    const customOptions = [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      `--user-data-dir=${profilePath}`,
      '--remote-allow-origins=*',
      "--disable-blink-features=AutomationControlled",
      "--excludeSwitches=enable-automation",
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      `useAutomationExtension=false`
    ];
    const chromeOption = {
                headless: false,
                args: customOptions,
              };
    const browser = await puppeteer.launch(chromeOption );
    this.profiles.set(userProfileId, browser);
    const backgroundPageTarget = await browser.waitForTarget(
      target => target.type() === 'background_page'
    );
    const backgroundPage = await backgroundPageTarget.page();
    console.log(backgroundPage.url())
    console.log('Tao profile moi ' +userProfileId );
    return this.profiles.get(userProfileId);
  }
  // mở một tab url 
 private async openUrl(browser: puppeteer.Browser, url: string): Promise<void> {
    const page1 = await browser.newPage();
    await this.screemDefault(page1);
    await page1.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36');
    await page1.evaluateOnNewDocument(() => {
      // Ghi đè các thuộc tính canvas để làm cho vân tay khác nhau
      const originalCreateElement = document.createElement;
      document.createElement = function(tagName) {
        if (tagName === 'canvas') {
          const canvas = originalCreateElement.call(document, tagName);
          const originalGetContext = canvas.getContext;
          canvas.getContext = function(contextType) {
            if (contextType === '2d') {
              return originalGetContext.call(canvas, contextType, { willReadFrequently: true });
            }
            return originalGetContext.call(canvas, contextType);
          }; 
          return canvas;
        }
        return originalCreateElement.call(document, tagName);
      };
    });
  await  page1.evaluateHandle("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})") 
 
   await page1.goto(url);
  }
  // lấy hết url đang mở 
private async currentTabs(browser: puppeteer.Browser): Promise<string[]> {
    const pages  = await browser.pages();
    const openUrls = [];
    for (const page of pages) {
      const url = await page.url();
      openUrls.push(url);
    }
   return openUrls;
  }
}