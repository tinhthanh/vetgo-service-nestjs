import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Ctx, MessagePattern, Payload, RmqContext, Transport } from '@nestjs/microservices';
import { PuppeteerService } from '../puppeteer.service';
import { ActionType, TaskLoginZlModel, TaskStatusModel } from '@vg/common';
@Controller()
export class TaskController {
  private client: ClientProxy; // Khai báo biến client là thành viên của class
  constructor(private readonly puppeteerService: PuppeteerService ,private configService: ConfigService) { // Inject ConfigService
    const amqpUrl = this.configService.get<string>('AMQP_URL'); // URL của RabbitMQ
    // Tạo ClientProxy sử dụng RabbitMQ với các cấu hình từ biến môi trường
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [amqpUrl], // URL của RabbitMQ
        queue: "api-gateway", // Tên queue của consumer
        queueOptions: {
          durable: false, // Queue không bền vững (không lưu lại khi RabbitMQ restart)
        },
      },
    });

  }
@MessagePattern(ActionType.LOGIN)
public async loginZl(@Payload() data: TaskLoginZlModel, @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMessage = context.getMessage();
  console.log('data', data);
  try {
    const rs = await this.excuteLoginZl(data);
    channel.ack(originalMessage);
    return rs;
  } catch (error) {
    console.log(error);
    channel.ack(originalMessage); // thông báo đã xử lý thành công
    return {id: data.phone, status: "failure".toUpperCase()};
  }
}
  sendProgress(data: TaskStatusModel) {
    this.client
    .send('status_task', data).subscribe();
  }
  public async excuteLoginZl(data: TaskLoginZlModel) {
    const url = 'https://id.zalo.me';
    const page = await this.puppeteerService.openOnlyUrl(data.phone, url);
    await new Promise((resolve) =>
      setTimeout(resolve, 2000),
    ); // chờ 2s nếu nó chuyển về chat.zalo.me thì đã login thành công
    const isRedirected = page.url().startsWith('https://chat.zalo.me');
    if(isRedirected) {
      return {id: data.phone , status: "DONE"};
    }
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
    this.sendProgress({id:data.phone , data: payload});
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
            this.sendProgress({id:data.phone , data: payload});
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
              this.sendProgress({id:data.phone , data: payload});
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
                  this.sendProgress({id:data.phone , data: payload});
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

}
