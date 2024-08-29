import { Body, Controller, Get, Post, Query, Sse, UseGuards } from "@nestjs/common";
import { PuppeteerService } from "../service/puppeteer.service";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Semaphore } from 'async-mutex';
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { v4 as uuidv4 } from 'uuid';
import { MessageEvent } from '@nestjs/common';

@UseGuards(ThrottlerGuard)
@Controller('prompts')
export class GptController {
  private readonly semaphore: Semaphore;
  private readonly profiles: Set<string>;
  private readonly availableProfiles: string[];
  private readonly sessions: Map<string, BehaviorSubject<MessageEvent>>;

  constructor(private readonly puppeteerService: PuppeteerService) {
    this.availableProfiles = ["profile1", "profile2", "profile3"];
    this.semaphore = new Semaphore(this.availableProfiles.length);
    this.profiles = new Set();
    this.sessions = new Map();

    setTimeout(async () => {
      for (let name of this.availableProfiles) {
        await this.puppeteerService.getChromeDriver(name);
        console.log('init ', name);
      }
    }, 0);
  }

  @Post("sse")
  @Sse()
  sse(@Body() body: { prompt: string, format?: 'text' | 'html' }): Observable<MessageEvent> {
    const sessionId = uuidv4(); // Tạo một session ID duy nhất cho mỗi yêu cầu
    const sessionSubject = new BehaviorSubject<MessageEvent>({data:null});
    this.sessions.set(sessionId, sessionSubject);
    return new Observable<MessageEvent>((ob) => {
      sessionSubject.subscribe(ob);
      this.executePromptsInternal(sessionId, body.prompt, body.format || 'text')
      .catch(error => {
        console.error(error);
        sessionSubject.error(error);
      })
      .finally(() => {
        sessionSubject.complete();
        this.sessions.delete(sessionId);
      });
    });
  }
  // hàm này call và đợi kết quả luôn
  @Post()
  executePrompts(@Body() body: { prompt: string, format?: 'text' | 'html' }): Observable<MessageEvent> {
    const sessionId = uuidv4(); // Tạo một session ID duy nhất cho mỗi yêu cầu
    const sessionSubject = new BehaviorSubject<MessageEvent>({data:null});
    this.sessions.set(sessionId, sessionSubject);
    this.executePromptsInternal(sessionId, body.prompt, body.format || 'text')
      .catch(error => {
        console.error(error);
        sessionSubject.error(error);
      })
      .finally(() => {
        sessionSubject.complete();
        this.sessions.delete(sessionId);
      });
    return sessionSubject.asObservable();
  }

  @Get('stream')
  @Sse()
  getPromptsStream(@Query('sessionId') sessionId: string): Observable<MessageEvent> {
    const sessionSubject = this.sessions.get(sessionId);
    console.log('sessionId ' ,sessionId);
    if (!sessionSubject) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }
    return sessionSubject.asObservable();
  }
  // hàm này để thực thi task
  private async executePromptsInternal(sessionId: string, prompt: string, format: 'text' | 'html' = 'text') {
    await this.semaphore.acquire();
    const profile = this.acquireProfile();
    const profileId = profile;
    const url = "https://chatgpt.com/";
    const selector = "#prompt-textarea";
    const page = await this.puppeteerService.openOnlyUrl(profileId, url);

    const sessionSubject = this.sessions.get(sessionId);
    if (!sessionSubject) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    try {
      await page.evaluate(() => {
        const popup = document.querySelector('[role="dialog"]');
        if (popup) {
          popup.querySelectorAll('a').forEach(it => it.click());
        }
      });

      await page.waitForSelector(selector);
      await page.focus(selector);
     const textLen = this.getRandomDelay(5, 10);
      const firstPart = prompt.slice(0,textLen );
      for (const char of firstPart) {
        await page.keyboard.type(char, { delay: this.getRandomDelay(100, 300) });
      }

      const remainingText = prompt.slice(textLen);
      await page.evaluate((selector, remainingText) => {
        const input = document.querySelector(selector) as HTMLInputElement;
        if (input) {
          input.value += remainingText;
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
        }
      }, selector, remainingText);
      console.log(`end step input text`);
      await  new Promise(resolve => setTimeout(resolve, this.getRandomDelay(500,2000)));
      await this.puppeteerService.pressKey(profileId, url, "#prompt-textarea", "Enter");
      console.log(`end step send key enter`);

      const selectorRender = '[data-testid="stop-button"]';
      const selectorMessage = '[data-message-author-role="assistant"]';
      // đợi cho cái button [data-testid="stop-button"] nó hiện lên
      await new Promise(resolve => setTimeout(resolve, this.getRandomDelay(500,2000)));
      console.log(`step đợi ${selectorRender} hiện lên`);
      await page.exposeFunction('emitMessage', (message: string) => {
        if(message) {
          sessionSubject.next({ data: message });
        }
      });
      await page.evaluate(async (selectorRender, selectorMessage, format) => {
        const isRender = () => document.querySelector(selectorRender);
        while (isRender()) {
          const list = document.querySelectorAll(selectorMessage);
          if (list.length > 0) {
            const el: any = list[list.length - 1];
            if (format === 'html') {
              (window as any).emitMessage(el.innerHTML);
            } else {
              (window as any).emitMessage(el.innerText);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }, selectorRender, selectorMessage, format);
    } catch (error) {
      console.error(error);
      throw new Error('Failed');
    } finally {
      if (!page.isClosed()) {
        setTimeout(async () => {
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
    }
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

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
