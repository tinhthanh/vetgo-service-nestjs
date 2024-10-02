import { EntityModel } from "../../base/base.type"

  export interface MessageModel extends EntityModel {
    sender: string;
    content: Content[];
    time: string;
    avatar: string;
    pinned: boolean;
    counter: number;
    mute: boolean;
  }

  export interface Content {
    id: string;
    type: 'text' | 'image';
    content: string;
    date: number;
  }
