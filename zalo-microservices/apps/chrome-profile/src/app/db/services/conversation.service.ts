import { Injectable } from "@nestjs/common";
import { BaseService } from "../../base/base.service";
import { MessageModel } from "../models/message.model";

@Injectable()
export class ConversationService extends BaseService<MessageModel> {
    constructor() {
      super("CONVERSATION");
    }

}
