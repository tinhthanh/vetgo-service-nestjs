export interface ActionModel {
  phone: string;                           // profileId
  actionType: 'SEND_KEY' | 'PASTE_IMAGE' | 'FORWARD';  // Các loại hành động có thể
  data: SendKeyData | PasteImageData | RequestForward;      // Dữ liệu hành động tương ứng
  url: string;                             // URL hiện tại
  messageStatus: 'NEW';                    // Trạng thái tin nhắn
}

export interface SendKeyData {
  selector: string;   // Selector của phần tử
  value: string;      // Giá trị cần gửi (cho SEND_KEY)
  isEnter: boolean;   // Flag cho việc có nhấn Enter hay không
  delay: number;      // delay khi typing
}

export interface PasteImageData {
  selector: string;   // Selector của phần tử
  url: string;        // URL của hình ảnh (cho PASTE_IMAGE)
}
export interface RequestForward {
  url: string;
  init?: RequestInit;
}


// model gui len
export interface FaceContact {
  name: string;
  msg: string;
  time: string;
  avt: string;
  pinned?: boolean;
}
