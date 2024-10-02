import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { TaskModel } from '../../task.model';

@Injectable()
export class InternalTaskService {
  private tasks = new Subject<TaskModel>();
  pullTask() {
    return this.tasks.asObservable();
  }
  pushTask(task: TaskModel) {
    this.tasks.next(task);
  }
}
