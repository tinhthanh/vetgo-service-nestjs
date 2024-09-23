export enum ActionType {
  ADD_FRIEND = 'ADD_FRIEND',
  LOGIN = 'LOGIN',
  SEND_MESSAGE  = 'SEND_MESSAGE'
}
// tạo task
export interface TaskModel {
  actionType: ActionType;
  data: {[key: string] : any};
}
export interface TaskLoginZlModel extends TaskModel {
  phone: string;
}
// phản hồi process task
export interface TaskStatusModel {
   id: string ; // id task or sdt cho trường hợp login
   data: {[key : string] : any}; // data process gửi về cho client
}
