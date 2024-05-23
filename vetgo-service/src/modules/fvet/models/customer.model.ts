import { EntityModel } from "./entity.model";
import { PetModel } from "./pet.model";

export class CustomerModel implements EntityModel {
    id?: string;
    deleted: boolean;
    sync: boolean;
    seqNo: number;
    fullName: string;
    phone: string;
    province: number;
    district: number;
    ward: number;
    address: string;
    addressFullText: string;
    url: string;
    pets?: PetModel[];
    brandId: string;
    lastUpdate: Date;
    sex: string;
    createdBy: string;
    createAt: Date;
    note: string;
    constructor(data: CustomerModel,convertDate: (date: Date) => any) {
      const clone: CustomerModel = {
        id: data.id,
        deleted: data.deleted,
        sync: data.sync,
        seqNo: data.seqNo,
        sex: data.sex || '',
        brandId: data.brandId || null,
        url: data.url || null,
        province: data.province || null,
        district: data.district || null,
        ward: data.ward || null,
        fullName: data.fullName || '',
        phone: data.phone || '',
        address:data.address || '',
        addressFullText: data.addressFullText || '',
        lastUpdate: convertDate(data.lastUpdate),
        createdBy: data.createdBy || null,
        createAt: convertDate(data.createAt),
        note: data.note || null
      };
      Object.assign(this,clone);
    }
  }