import {EntityModel} from "./entity-model";
import {convertDate} from "../utils/db-utils";

export class DeviceRemoteModel implements EntityModel {
  id?: string;
  deleted: boolean;
  qrCode: string;
  lastUpdate: Date;
  phone: string;
  email: string;
  constructor(data: DeviceRemoteModel) {
    const clone: DeviceRemoteModel = {
      id: data.id,
      deleted: data.deleted,
      qrCode: data.qrCode || '' ,
      lastUpdate: convertDate(data.lastUpdate),
      phone: data.phone || '' ,
      email: data.email || ''
    };
    Object.assign(this, clone);
  }
}
