import { Injectable, OnModuleInit } from '@nestjs/common';
import { VgWebSocketService } from '../vg-websocket.service';
import { v4 as uuidv4 } from 'uuid';
import { Mutex } from 'async-mutex'; // Thêm Mutex từ async-mutex
import { PuppeteerService } from '../puppeteer.service';

export class ActionType {
    action: "PING" | "LOGIN";
    clientId: string;
}

@Injectable()
export class SocialSignInService extends VgWebSocketService implements OnModuleInit {
    
    url = `https://socketonly.moonpet.vn`;
    workerId = uuidv4();
    private mutex = new Mutex(); // Tạo một Mutex

    constructor(private readonly puppeteerService: PuppeteerService) {
            super();
    }

    onModuleInit() {
        this.executeTask("0981773084");
        this.connect(`${this.url}/ws`);
        console.log('init ws');
        this.register("browser-task", async (data: { message: string }) => {
            try {
                const { message } = data;
                const payload: ActionType = JSON.parse(message);
                console.log(payload);

                // Sử dụng Mutex để đảm bảo task thực thi tuần tự
                const release = await this.mutex.acquire(); // Khóa mutex trước khi xử lý

                try {
                    if (payload.action === 'PING' && payload.clientId) {
                        // Nếu đang thực hiện task, bỏ qua việc gửi PONG
                        if (this.mutex.isLocked()) {
                            console.log('Task is running, skipping PONG...');
                            return;
                        }
                        console.log('Sending PONG...');
                        this.sendMessage("browser-task", {
                            action: 'PONG',
                            workerId: this.workerId,
                            clientId: payload.clientId
                        }).subscribe();
                    }

                    if (payload.action === 'LOGIN' && payload.clientId) {
                        console.log('Executing LOGIN task...');
                        await this.executeTask(payload.clientId);
                    }
                } finally {
                    release(); // Giải phóng mutex khi hoàn thành task
                }
            } catch (error) {
                console.log('Cannot parse JSON', error);
            }
        });
    }

    // Giả lập thời gian thực thi task
    async executeTask(profileId: string) {
        console.log('Task started');
        const url = 'https://www.google.com/?hl=vi';
        const page = await this.puppeteerService.openOnlyUrl(profileId, url);
         // Sử dụng JavaScript để yêu cầu full screen
        // await page.evaluate(() => {
        //     const elem = document.documentElement; // Toàn bộ tài liệu
        //     if (elem.requestFullscreen) {
        //         elem.requestFullscreen(); // Kích hoạt chế độ toàn màn hình
        //     }
        // });
        await page.waitForSelector('[aria-label="Đăng nhập"]');
        await page.click('[aria-label="Đăng nhập"]');
        // TODO luôn chỉnh chế độ full màm hình 
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Task completed');
                resolve(null);
            }, 10000);
        });
    }
}
