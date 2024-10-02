export enum ActionType {
  ADD_FRIEND = 'ADD_FRIEND',
  LOGIN = 'LOGIN',
  SEND_MESSAGE  = 'SEND_MESSAGE',
  LIST_MESSAGE = 'LIST_MESSAGE', // danh sách tin nhắn ở menu left
  LIST_CONTACT = 'LIST_CONTACT', // lấy danh sách liên hệ
  OPEN_CHAT = 'OPEN_CHAT',
  RELOAD = 'RELOAD' // reloa lại trang
}
// tạo task
export interface TaskModel {
  id: string;
  actionType: ActionType;
  data: {[key: string] : any}; // data process gửi về cho client
  priority: number;
  isCancelled?: boolean; // Đánh dấu task đã bị hủy
  phone: string;
}
