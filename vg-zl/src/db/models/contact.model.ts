import { EntityModel } from "../../base/base.type";

export interface ContactModel extends EntityModel {
    name: string;
    msg: string;
    time: string;
    avt: string;
}
