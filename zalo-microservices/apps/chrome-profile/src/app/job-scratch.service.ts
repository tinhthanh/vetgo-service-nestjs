import { Injectable } from "@nestjs/common";
import { PuppeteerService } from "./puppeteer.service";
import { take } from "rxjs";
import * as path from 'path';
const fs = require('fs').promises;
import { HttpService } from "@nestjs/axios";
import { TaskModel } from "@vg/common";
import { ContactService } from "./db/services/contact.service";
import { ListMessageService } from "./db/services/list-message.service";
import { ConversationService } from "./db/services/conversation.service";
@Injectable()
export class JobScratchService {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly contactService: ContactService,
    private readonly listMessageService: ListMessageService,
    private readonly httpService: HttpService,private readonly puppeteerService: PuppeteerService) {}

  public async handleLoginTask(data: TaskModel, destination: string) {
    // const url = 'https://id.zalo.me';
    const page = await this.puppeteerService.openOnlyUrl(data.phone, "https://id.zalo.me");
    await new Promise( async (rs) => {
        setTimeout(()=> rs(null), 3000 );
        while (page.url().startsWith('https://chat.zalo.me')) {
            rs(null);
            await new Promise( (rs) => setTimeout(()=> rs(null), 50 ));
        }
    } );
    console.warn(page.url());
    if(page.url().startsWith('https://chat.zalo.me')) { // kiểm tra login chưa
      const payload =  {id: data.phone , status: "DONE"};
      console.warn(payload);
      console.warn(destination);
      this.sendProgress(payload,destination);
      return payload ;
    }
    // xử lý cho việc login lại
    await page.waitForSelector('div.qrcode img');
    let qrCode = await page.$eval('div.qrcode img', (img) => img.getAttribute('src'));
    const phone = data.phone;
    // Tải QR code lên Firebase lần đầu tiên
    const payload = {
      id: phone,
      qr: qrCode,
      status: null,
      img: null,
      seqNo: new Date().getTime()
    }
    this.sendProgress(payload,destination);
    console.log('QR code initial upload done');

    // Sử dụng promise để đợi khi nào điều kiện hoàn thành
    return new Promise((resolve, reject) => {
      // Khởi tạo setInterval và lưu lại ID
      const intervalId = setInterval(async () => {
        try {
          const currentUrl = page.url();
          // Kiểm tra URL hiện tại có phải là https://chat.zalo.me hay không
          const isRedirected = currentUrl.startsWith('https://chat.zalo.me');
          if (isRedirected) {
            const payload = {
              id: phone,
              qr: null,
              status: 'DONE',
              img: null,
              seqNo: new Date().getTime()
            }
            this.sendProgress(payload,destination);
            clearInterval(intervalId); // Dừng interval khi hoàn thành
            resolve(payload);
            return;
          }
          // Kiểm tra nếu QR code hết hạn
          const isExpired = await page.$('div.qrcode.disabled');
          if (isExpired) {
            await page.click('div.qrcode-expired a');
          }
          // Kiểm tra và cập nhật QR code mới nếu có
          const img = await page.$('div.qrcode img');
          if(img) {
            let qrTmp = await page.$eval('div.qrcode img', (img) => img.getAttribute('src'));
            if (qrTmp && qrTmp !== qrCode) {
              qrCode = qrTmp;
              const payload = {
                id: phone,
                qr: qrCode,
                status: null,
                img: null,
                seqNo: new Date().getTime()
              }
              console.warn(destination);
              console.warn(payload);
              this.sendProgress(payload,destination);
            }
          }

          const avt = await page.$('span.avatar');
          if(avt) {
            // Kiểm tra avatar và lấy URL ảnh từ CSS
            const avatarStyle = await page.$eval('span.avatar', (avatar) => avatar.getAttribute('style'));
            if (avatarStyle) {
              const regex = /url\(["']?([^"']*)["']?\)/; // Biểu thức chính quy để trích xuất URL
              const matches = avatarStyle.match(regex);

              if (matches && matches.length > 1) {
                const imageUrl = matches[1]; // Lấy link từ kết quả trùng khớp
                console.log('Avatar image URL:', imageUrl);
                if (qrCode) {
                  const payload = {
                    id: phone,
                    qr: qrCode,
                    status: 'CONFIRM',
                    img: imageUrl,
                    seqNo: new Date().getTime()
                  }
                  this.sendProgress(payload,destination);
                  qrCode = null;
                  clearInterval(intervalId);
                  page.on('framenavigated', async (frame) => {
                    if (frame === page.mainFrame()) {
                      console.log('Trang chính đã điều hướng đến:', frame.url());
                      // Bạn có thể kiểm tra URL hoặc thực hiện các hành động khác ở đây
                      const payload = {
                        id: phone,
                        qr: null,
                        status: 'DONE',
                        img: null,
                        seqNo: new Date().getTime()
                      }
                      this.sendProgress(payload, destination);
                       resolve(payload);
                    }
                  });
                }
              } else {
                console.log('Không tìm thấy URL ảnh trong chuỗi CSS.');
              }
            }
          }

        } catch (error) {
          console.log(error);
          clearInterval(intervalId); // Dừng interval nếu có lỗi
          reject(error);
        }
      }, 500);
    });
  }
  async getListMessage(data: TaskModel, destination: string) {
    const page = await this.puppeteerService.openOnlyUrl(data.phone, "https://chat.zalo.me");
    console.log('Job getListMessage run');
    await new Promise( (rs) => setTimeout(()=> rs(null), 2000 ));
     // return cache
     const cache = await this.listMessageService.getAll(data.phone);
     console.log('cache: ' , cache.length);
     this.sendProgress(cache, destination);
       const url = await page.url();
        if(url.startsWith('https://chat.zalo.me')) {
           const scriptPath = path.join(__dirname, 'assets', 'scripts', 'get-list-message.js');
           const scriptContent = await fs.readFile(scriptPath, 'utf8');
             // Thực thi mã JavaScript từ file script.js trên trang web
             const result = await page.evaluate(scriptContent);
             console.warn('send to ', result);
             if(result) {
               this.sendProgress(result, destination);
               this.listMessageService.saveAll(data.phone,result).then(()=> {
                console.log('save list message done');
              });
             }
         } else {
            console.log('Tài khoản bị đăng xuất');
    }
}
 async getListContact(data: TaskModel, destination: string) {
    const page = await this.puppeteerService.openOnlyUrl(data.phone, "https://chat.zalo.me");
       console.log('Job getListContact run');
       await new Promise( (rs) => setTimeout(()=> rs(null), 2000 ));
        // return cache
        const cache = await this.contactService.getAll(data.phone);
        console.log('cache: ' , cache.length);
        this.sendProgress(cache, destination);
          const url = await page.url();
           if(url.startsWith('https://chat.zalo.me')) {
              const scriptPath = path.join(__dirname, 'assets', 'scripts', 'get-list-contact.js');
              const scriptContent = await fs.readFile(scriptPath, 'utf8');
                // Thực thi mã JavaScript từ file script.js trên trang web
                const result = await page.evaluate(scriptContent);
                console.warn('send to ', result);
                if(result) {
                  this.sendProgress(result, destination);
                  this.contactService.saveAll(data.phone,result).then(()=> {
                    console.log('save list contact done');
                  });
                }
            } else {
               console.log('Tài khoản bị đăng xuất');
            }
  }
  async openMessage(data: TaskModel, destination: string) {
    const page = await this.puppeteerService.openOnlyUrl(data.phone, "https://chat.zalo.me");
       console.log('Job openMessage run');
       await new Promise( (rs) => setTimeout(()=> rs(null), 2000 ));
          const url = await page.url();
           if(url.startsWith('https://chat.zalo.me')) {
            // chuyền input
            const scriptName = 'open-chat.js';
            if(!data.data?.avt) {
              return;
            }
            const inputParam = {avt: data.data?.avt};
            const keyCache = `${data.phone}-${inputParam.avt.split('/').pop()}`;
            console.warn(keyCache);
            const cache = await this.conversationService.getAll(keyCache);
            this.sendProgress(cache, destination);
            await page.evaluate((scriptName,input) => {
              sessionStorage.setItem(scriptName, JSON.stringify(input));
            },scriptName, inputParam);
            // end chuyền input

              const scriptPath = path.join(__dirname, 'assets', 'scripts', scriptName);
              const scriptContent = await fs.readFile(scriptPath, 'utf8');
                // Thực thi mã JavaScript từ file script.js trên trang web
                const isFound = await page.evaluate(scriptContent);
                 if(isFound) { // tìm thấy tiến hành cào data khung chát
                  const scriptGetConversation = await fs.readFile(path.join(__dirname, 'assets', 'scripts', "conversation.js"), 'utf8');
                    // Thực thi mã JavaScript từ file script.js trên trang web
                    const listMess = await page.evaluate(scriptGetConversation);
                        if(listMess) {
                          this.sendProgress(listMess, destination);
                          this.conversationService.saveAll(keyCache,listMess);
                         }
                 } else {
                  // TODO nếu k thấy ở danh sách message đi luồng seach native
                  // xong chạy lại open-chat.js để tìm lại
                 }


            } else {
               console.log('Tài khoản bị đăng xuất');
            }
  }
  async sendMessage(data: TaskModel, destination: string) {
    const page = await this.puppeteerService.openOnlyUrl(data.phone, "https://chat.zalo.me");
    console.log('Job sendMessage run');
    await new Promise( (rs) => setTimeout(()=> rs(null), 3000 ));
       const url = await page.url();
        if(url.startsWith('https://chat.zalo.me')) {
         // chuyền input
         const scriptName = 'open-chat.js';
         if(!data.data?.avt) {
           return;
         }
         const inputParam = data.data;
         await page.evaluate((scriptName,input) => {
           sessionStorage.setItem(scriptName, JSON.stringify(input));
         },scriptName, inputParam);
         // end chuyền input

           const scriptPath = path.join(__dirname, 'assets', 'scripts', scriptName);
           const scriptContent = await fs.readFile(scriptPath, 'utf8');
             // Thực thi mã JavaScript từ file script.js trên trang web
             const isFound = await page.evaluate(scriptContent);
              if(isFound) { // tìm thấy tiến hành cào data khung chát
                 // TODO send messageee
                 const scriptSendMessageName = "send-message.js";
                 const scriptSendMessage = await fs.readFile(path.join(__dirname, 'assets', 'scripts', scriptSendMessageName), 'utf8');
                 await page.evaluate((scriptSendMessageName,input) => {
                  sessionStorage.setItem(scriptSendMessageName, JSON.stringify(input));
                },scriptSendMessageName, inputParam);
                 await page.evaluate(scriptSendMessage);
                //  const scriptGetConversation = await fs.readFile(path.join(__dirname, 'assets', 'scripts', "conversation.js"), 'utf8');
                //  // Thực thi mã JavaScript từ file script.js trên trang web
                //  const listMess = await page.evaluate(scriptGetConversation);
                //      if(listMess) {
                //        this.sendProgress(listMess, destination);
                //       }
              } else {
               // TODO nếu k thấy ở danh sách message đi luồng seach native
               // xong chạy lại open-chat.js để tìm lại
              }


         } else {
            console.log('Tài khoản bị đăng xuất');
         }
  }
  sendProgress<T>(data: T, destination: string) {
    this.httpService.post(
      'https://socketonly.moonpet.vn/api/notification/push',
      data,
      {
        headers: {
          realm: destination,
          'Content-Type': 'application/json',
        },
      },
    ).pipe(take(1)).subscribe();
  }
}
