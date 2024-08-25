import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { PuppeteerService } from "../service/puppeteer.service";
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Semaphore } from 'async-mutex';
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
@UseGuards(ThrottlerGuard)
@Controller('ocr')
export class GoogleLenController {
    private readonly semaphore: Semaphore;
    private readonly profiles: Set<string>;
    private readonly availableProfiles: string[];

    constructor(private readonly puppeteerService: PuppeteerService) {
        this.availableProfiles = ["profile1", "profile2", "profile3", "profile4", "profile5"];
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
    @Get("img")
    async searchByUrl(@Query('url') url: string): Promise<{ text: string }> {
        if (!url) {
            throw new BadRequestException('URL is required');
        }
        return this.searchImage(url);
    }
    // còn một số vấn đề , khi lượng truy cập cao hay bị lỗi 
    // giới hạn hiện tại 5 giây -> 5 request, trung bình 1s hỗ trợ 1 request
    @Throttle({ default: { limit: 5, ttl: 5000 } })
    @Post('img')
    async searchImage(@Body('url') url: string, @Body('base64') base64?: string): Promise<{ text: string }> {
        await this.semaphore.acquire();
        const profile = this.acquireProfile();
        const browser = await this.puppeteerService.getChromeDriver(profile);
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setViewport({
        width: 1920,
        height: 1080,
        });
        await page.evaluateOnNewDocument(() => {
            delete navigator['__proto__'].webdriver;
        });
        const tempFilePath = path.join(__dirname, `${profile}-temp-image.png`);

        try {
            await page.goto('https://images.google.com?hl=vi-VN', { waitUntil: 'load', timeout: 60000 });
            await page.waitForSelector('[data-base-lens-url]', { timeout: 60000 });
            await page.click('[data-base-lens-url]');

            let imageBuffer: Buffer;

            if (base64) {
                const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
                imageBuffer = Buffer.from(base64Data, 'base64');
            } else if (url) {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                if (response.status !== 200 || !response.data) {
                    throw new BadRequestException('URL not found');
                }
                imageBuffer = Buffer.from(response.data, 'binary');
            } else {
                throw new Error('Either URL or base64 must be provided');
            }

            fs.writeFileSync(tempFilePath, imageBuffer);
            // TODO giup toi chup anh man hinh va luu lai
            const screenshotPath = path.join(__dirname, `${profile}-screenshot.png`);
            await page.screenshot({ path: screenshotPath });
            const fileInput = await page.waitForSelector('input[type="file"]', { timeout: 60000 });
          
            await fileInput.uploadFile(tempFilePath);

            if (page.isClosed()) {
                throw new Error('Page has been closed unexpectedly');
            }

            const result = await page.waitForFunction(async () => {
                const isNoText = () =>
                    [...document.querySelectorAll('img')].find((it: HTMLImageElement) =>
                        (it.getAttribute('src') || '').includes('no_text_failure')
                    );

                const isShowTranslate = () =>
                    [...document.querySelectorAll('h1')].find((it) => it.innerText === 'Bản dịch');

                while (!isShowTranslate() && !isNoText()) {
                    const targetButton = [...document.querySelectorAll('button')].find((it) => it.innerText === 'Dịch');
                    if (targetButton) {
                        (targetButton as HTMLElement).click();
                        console.log('click -> ', targetButton);
                    }
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                if (isNoText()) {
                    console.log('isNoText');
                    return { text: null };
                }

                const elText = () => (document.querySelector('[jsaction^="keydown"]') as HTMLElement)?.innerText || null;
                while (!elText()) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
                return { text: elText() };
            });

            return result.jsonValue();
        } catch (error) {
            console.error('Error:', error);
            throw new Error('Failed to search image');
        } finally {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
                console.log('Deleted temporary file:', tempFilePath);
            }
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
}
