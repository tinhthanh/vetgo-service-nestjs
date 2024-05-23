import { EntityModel } from "./entity.model";
import { PetHistoryModel } from "./pet-history.model";

export class PetModel implements EntityModel {
    id?: string;
    seqNo: number;
    deleted: boolean;
    sync: boolean;
    avatar: string;
    name: string;
    birthDay: Date;
    breed: string;
    species: string;
    sex: string;
    code: string;
    customerId: string;
    histories?: PetHistoryModel[];
    qrCode: string;
    spaying: boolean; // triet san
    birthdayTyping: boolean;
    createdBy: string;
    createAt: Date;
    petColors: string;
    dead: boolean;
    weight?: number;
    constructor(data: PetModel, convertDate: (date: Date) => any) {
      const clone: PetModel  = {
        id: data.id,
        seqNo: data.seqNo,
        deleted: data.deleted,
        sync: data.sync,
        spaying: data.spaying || null,
        avatar: data.avatar || null,
        sex: data.sex || null,
        code: data.code || null,
        customerId: data.customerId || null,
        qrCode: data.qrCode || null,
        birthdayTyping: data.birthdayTyping || null,
        name: data.name || null,
        birthDay: convertDate(data.birthDay),
        breed: data.breed || null,
        species: data.species || null,
        createdBy: data.createdBy || null,
        createAt: convertDate(data.createAt),
        petColors: data.petColors || null,
        dead: data.dead || null,
        weight: data?.weight || null
      };
      Object.assign(this, clone );
    }
  }