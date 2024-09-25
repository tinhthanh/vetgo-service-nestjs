import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ActionType, TaskModel } from "@vg/common";
import { VgWsService }  from "@vg/ws";
import { Subject } from "rxjs";
import { Mutex } from 'async-mutex';
import { JobScratchService } from "./job-scratch.service";
// để đảm bảo tính sẵn sàng cần mở 2 kết nối socket
// thêm cơ chế 5p tắt 1 con mở lại luôn phiên 2 con
// lắng nghe socket theo destination là sdt /0981773084
// giao task thì cứ push vào /0981773084 mỗi task uuid , trường hợp online phải phản hồi lại client đã nhận task
// 2 kết nối web socket dựa vào task uuid để lọc trùng
// UUID có các dụng để check trạng thái của task đã làm xong chưa
@Injectable()
export class TaskService {
  tasks = new Subject<TaskModel>();

  private taskQueue: TaskModel[] = []; // Hàng đợi task
  private isProcessing = false; // Biến kiểm tra xem có đang xử lý task nào không
  private queueMutex = new Mutex(); // Sử dụng Mutex để đảm bảo đồng bộ

  constructor(private jobScratchService: JobScratchService ,private readonly configService: ConfigService) {
    const realm = this.configService.get('REALM');
    this.processQueue(); // Khởi động quá trình xử lý hàng đợi

    const ws = new VgWsService();
    const url = this.configService.get<string>('WS');
    console.log(url);
    ws.connect(url);
    ws.register(realm, async (task: TaskModel) => {

      if(!task.actionType) {
        if(task['message']) {
          console.warn('push task' ,task['message']);
          this.tasks.next(task['message']);
        }
        return;
      }
      console.warn('task ' ,task);
      this.tasks.next(task);
    });
    this.tasks.pipe(
      // distinctUntilChanged( (pre,cur)=> {
      //   return isEqual(pre ,cur);
      // })
    ).subscribe(async (task: TaskModel) => {
       await this.addTaskToQueue(task);
    });
  }
  // Xử lý task từ hàng đợi
  private async processQueue() {
    // Nếu đang xử lý task khác hoặc hàng đợi rỗng thì return
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    // Đánh dấu trạng thái đang xử lý
    this.isProcessing = true;

    // Sử dụng mutex để đảm bảo thao tác trên hàng đợi là đồng bộ
    const release = await this.queueMutex.acquire();
    try {
      const task = this.taskQueue.shift(); // Lấy task đầu tiên ra khỏi hàng đợi

      // Nếu task đã bị hủy, bỏ qua và tiếp tục với task tiếp theo
      if (task.isCancelled) {
        console.log(`Task ${task.id} has been skipped because it was cancelled`);
        this.isProcessing = false;
        return this.processQueue(); // Tiếp tục xử lý task tiếp theo
      }
      const realm = this.configService.get('REALM');
      const destination = `${realm}/${task.phone}/${task.actionType}`;
      // Xử lý task không bị hủy
      if (task.actionType === ActionType.LOGIN) {
        await this.jobScratchService.handleLoginTask(task,destination);
      }
      //lấy danh sách tin nhắn mới
      if(task.actionType === ActionType.LIST_MESSAGE) {
        await this.jobScratchService.getListMessage(task,destination);
      }
      // lấy danh sách danh bạ
      if(task.actionType === ActionType.LIST_CONTACT) {
        await this.jobScratchService.getListContact(task,destination);
      }
     // open khung chat
     if(task.actionType === ActionType.OPEN_CHAT) {
        await this.jobScratchService.openMessage(task,destination);
    }
    } catch (error) {
      console.error('Error processing task:', error);
    } finally {
      release(); // Giải phóng mutex
      this.isProcessing = false; // Đánh dấu trạng thái không còn xử lý
      this.processQueue(); // Tiếp tục xử lý các task khác trong hàng đợi
    }
  }



  async addTaskToQueue(task: TaskModel) {
    // Sử dụng mutex để đảm bảo thao tác thêm vào hàng đợi là đồng bộ
    const release = await this.queueMutex.acquire();
    try {
      this.taskQueue.push(task);
      this.taskQueue.sort((a, b) => b.priority - a.priority); // Sắp xếp theo độ ưu tiên
      this.processQueue(); // Kiểm tra và xử lý hàng đợi
    } finally {
      release(); // Giải phóng mutex
    }
  }
   // Hủy task trong hàng đợi
   async cancelTask(taskId: string) {
    // Sử dụng mutex để đảm bảo thao tác hủy task là đồng bộ
    const release = await this.queueMutex.acquire();
    try {
      const task = this.taskQueue.find(t => t.id === taskId);
      if (task) {
        task.isCancelled = true; // Đánh dấu task đã bị hủy
        console.log(`Task ${taskId} has been cancelled`);
      }
    } finally {
      release(); // Giải phóng mutex
    }
  }
}
