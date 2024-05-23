import { EntityModel } from "./entity.model";

export class UserModel implements EntityModel {
    id?: string;
    seqNo: number;
    deleted: boolean;
    sync: boolean;
    passport: string;
    displayName: string;
    phone: string;
    email: string;
    password?: string;
    date: Date;
    uid: string;
    address: string;
    emailVerified: boolean;
    photoURL: string;
    role: string;
    active: boolean;
    brandId: string;
    constructor(data: UserModel,convertDate: (date: Date) => any) {
      const clone: UserModel = {
        id: data.id,
        deleted: data.deleted,
        sync: data.sync,
        seqNo: data.seqNo,
        email: data.email || null,
        uid: data.uid || null,
        emailVerified: data.emailVerified || null,
        photoURL: data.photoURL || null,
        role: data.role || null,
        active: data.active || false,
        brandId: data.brandId || null,
        passport: data.passport || null,
        displayName: data.displayName || null,
        phone: data.phone || null,
        date: convertDate(data.date),
        address: data.address || null,
      };
      Object.assign(this, clone);
    }
  }