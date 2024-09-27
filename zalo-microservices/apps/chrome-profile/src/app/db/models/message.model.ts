import { EntityModel } from "../../base/base.type"

  export interface MessageModel extends EntityModel {
    sender: string
    content: Content[]
    time: string
    avatar: string
  }

  export interface Content {
    type: 'text' | 'image'
    content: string
  }
