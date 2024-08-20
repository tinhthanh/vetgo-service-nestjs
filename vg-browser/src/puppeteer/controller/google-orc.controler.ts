import { BadRequestException, Body, Controller, Get, OnModuleDestroy, Post, Query } from "@nestjs/common";
import { PuppeteerService } from "../service/puppeteer.service";
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Sema } from 'async-sema';

@Controller('ocr')
export class GoogleLenController {
    private readonly semaphore: Sema;
    private readonly profiles: Set<string>;
    private readonly availableProfiles: string[];

    constructor(private readonly puppeteerService: PuppeteerService) {
        this.semaphore = new Sema(5); // Giới hạn tối đa 5 trình duyệt chạy đồng thời
        this.profiles = new Set();
        this.availableProfiles = ["profile1", "profile2", "profile3", "profile4", "profile5"];
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
    @Get('img')
    async searchByUrl(@Query('url') url: string): Promise<{ text: string }> {
        if (!url) {
            throw new BadRequestException('URL is required');
        }
        return this.searchImage(url);
    }
    @Post('img')
    async searchImage(@Body('url') url: string, @Body('base64') base64?: string): Promise<{ text: string }> {
        await this.semaphore.acquire();
        
        const profile = this.acquireProfile();
        const browser = await this.puppeteerService.getChromeDriver(profile);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        // await page.setViewport({
        //     width: 1920,
        //     height: 1080,
        //   });
        // await page.evaluateOnNewDocument(() => {
        //     delete navigator['__proto__'].webdriver;
        // });
        
        // Định nghĩa đường dẫn tệp tạm thời dựa trên profile
        const tempFilePath = path.join(__dirname, `${profile}-temp-image.png`);
        
        try {
            // Mở trang Google Images
            await page.goto('https://images.google.com?hl=vi-VN');
            await page.waitForSelector('[data-base-lens-url]');
            await page.click('[data-base-lens-url]');

            let imageBuffer: Buffer;

            if (base64) {
                // Nếu base64 được truyền, chuyển đổi base64 thành buffer
                const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
                imageBuffer = Buffer.from(base64Data, 'base64');
            } else if (url) {
                // Nếu không có base64, tải ảnh từ URL
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                if(response.status !== 200 || response.data === undefined) {
                    throw new BadRequestException('URL not found');
                }
                imageBuffer = Buffer.from(response.data, 'binary');
            } else {
                throw new Error('Either URL or base64 must be provided');
            }

            // Lưu hình ảnh vào file tạm thời
            fs.writeFileSync(tempFilePath, imageBuffer);

            // Mô phỏng việc tải lên file bằng Puppeteer
            const fileInput = await page.waitForSelector('input[type="file"]');
            await fileInput.uploadFile(tempFilePath);

            // Đợi kết quả hiển thị
            const result = await page.waitForFunction(async () => {
                // Kiểm tra xem có văn bản trong ảnh hay không
                const isNoText = () =>
                    [...document.querySelectorAll('img')].find((it: HTMLImageElement) =>
                        (it.getAttribute('src') || '').includes('no_text_failure')
                    );

                // Kiểm tra xem kết quả dịch có hiển thị hay không
                const isShowTranslate = () =>
                    [...document.querySelectorAll('h1')].find((it) => it.innerText === 'Bản dịch');

                while (!isShowTranslate() && !isNoText()) {
                    // Nhấn vào nút 'Dịch' nếu có
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

                // Đợi kết quả dịch
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
            // Đóng page và browser
                try {
                    await page.close();
                    console.log('page -> close');
                } catch (error) {
                    console.error('cannot close');
                }
            // Xoá tệp tin tạm thời
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
                console.log('Deleted temporary file:', tempFilePath);
            }

            this.releaseProfile(profile);
            this.semaphore.release();
        }
    }
}
