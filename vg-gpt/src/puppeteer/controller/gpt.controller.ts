import { Body, Controller, Get, Post, Query, Sse, UseGuards } from "@nestjs/common";
import { PuppeteerService } from "../service/puppeteer.service";
import { BehaviorSubject, Observable } from "rxjs";
import { Semaphore } from 'async-mutex';
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
@UseGuards(ThrottlerGuard)
@Controller('prompts')
export class GptController {
  private readonly semaphore: Semaphore;
  private readonly profiles: Set<string>;
  private readonly availableProfiles: string[];

    constructor(private readonly puppeteerService: PuppeteerService){
      this.availableProfiles = ["profile1", "profile2", "profile3"];
      this.semaphore = new Semaphore(this.availableProfiles.length); // Giới hạn tối đa 5 trình duyệt chạy đồng thời
      this.profiles = new Set();
      setTimeout(async ()=> {
        for( let name of this.availableProfiles) {
            await this.puppeteerService.getChromeDriver(name);
            console.log('init ' , name);
        }
      }, 0);
    }
    private acquireProfile(): string {
      for (const profile of this.availableProfiles) {
          if (!this.profiles.has(profile)) {
              this.profiles.add(profile);
              return profile;
          }
      }
      throw new Error('No available profiles');
  }

  private releaseProfile(profile: string) {
      this.profiles.delete(profile);
  }
  
    @Post()
    @Sse()
     prompts(@Body() body: {prompt: string, format?:'text' | 'html' }): Observable<MessageEvent | string> {
     return new Observable<MessageEvent | string>(observer => {

       this.excutePrompts(body.prompt ,(data: string) => {
         observer.next(data);
       },body.format).then(data=> {
          observer.next(data);
          observer.complete();
         });
      });
    }
   async excutePrompts(prompt: string, callBack:(data: string) => void, format: 'text' | 'html' = 'text' ) {
    await this.semaphore.acquire();
    const profile = this.acquireProfile();
    const profileId = profile;
      const url = "https://chatgpt.com/";
      const text = prompt;
      const selector = "#prompt-textarea";
      const page = await this.puppeteerService.openOnlyUrl(profileId,url );
      try {
        await page.evaluate(() => {
          const popup = document.querySelector('[role="dialog"]');
          if (popup) {
            console.log('Popup found. Closing...');
            // Click vào tất cả các liên kết trong popup để đóng nó
            popup.querySelectorAll('a').forEach(it => it.click());
          }
        });
        // lâu lâu nó hiện cái popup kêu đăng nhập
        await page.waitForSelector(selector);
        await page.focus(selector);
        // Gõ 5 ký tự đầu tiên
        const firstPart = text.slice(0, 5);
        for (const char of firstPart) {
          await page.keyboard.type(char, { delay: this.getRandomDelay(100, 300) });
        }
        // Sao chép phần còn lại vào clipboard và dán vào input
        const remainingText = text.slice(5);
        // Sử dụng evaluate để thao tác với clipboard và input trên trang
        await page.evaluate((selector, remainingText) => {
          const input = document.querySelector(selector) as HTMLInputElement;
          if (input) {
            // Thêm phần còn lại vào clipboard và dán vào input
            input.value += remainingText;
            // Dispatch event 'input' để cập nhật DOM
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
          }
        }, selector, remainingText);
          await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
          await this.puppeteerService.pressKey(profileId,url,"#prompt-textarea", "Enter");
          const selectorRender = '[data-testid="stop-button"]';
          const selectorMessage = '[data-message-author-role="assistant"]';
          const $result = new BehaviorSubject("");
          // Expose function để có thể gọi từ trong evaluate
          await page.exposeFunction('emitMessage', (message: string) => {
            $result.next(message);
            callBack(message);
          });
         await page.evaluate(async (selectorRender, selectorMessage, format) => {
        const isRender = () => document.querySelector(selectorRender);
      
        while (isRender()) {
          const list = document.querySelectorAll(selectorMessage);
          if (list.length > 0) {
            const el: any = list[list.length - 1];
            // Gửi giá trị qua Subject bằng cách gọi hàm đã expose
            // Tương đương với $result.next(el.innerText);
            if(format === 'html') {
              (window as any).emitMessage(el.innerHTML);
            } else {
              (window as any).emitMessage(el.innerText);
            }
            // Tạm dừng 100ms trước khi tiếp tục
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }, selectorRender, selectorMessage,format);
          // callBack($result.value)
          // observer.complete();
          return $result.value;
      } catch (error) {
        throw new Error('Failed');
      } finally { 
        try {
          if (!page.isClosed()) {
              setTimeout(async () => { // đang trick để k bị daft app
                  try {
                      await page.close();
                  } catch (error) {
                      console.error('Error closing page:', error);
                  } finally {
                      this.releaseProfile(profile);
                      this.semaphore.release();
                  }
              }, 1000);
          }
      } catch (error) {
          console.error('cannot close');
      }
      }
  
    }
    private getRandomDelay(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}