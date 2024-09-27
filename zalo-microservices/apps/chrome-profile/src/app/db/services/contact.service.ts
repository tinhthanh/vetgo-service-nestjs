import { Injectable } from "@nestjs/common";
import { BaseService } from "../../base/base.service";
import { ContactModel } from "../models/contact.model";

@Injectable()
export class ContactService extends BaseService<ContactModel> {
    constructor() {
      super("CONTACT");
    }

}
