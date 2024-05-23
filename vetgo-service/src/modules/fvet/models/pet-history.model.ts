import { EntityModel } from "./entity.model";
export enum
HistoryType {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  KB = 'KB', // Tham kham
  // eslint-disable-next-line @typescript-eslint/naming-convention
  TN = 'TN', // tiem ngua
  // eslint-disable-next-line @typescript-eslint/naming-convention
  LT = 'LT', // lua tru
  // eslint-disable-next-line @typescript-eslint/naming-convention
  XN = 'XN', // Xet nghiem,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  LH = 'LH', //  lich hen
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SPA = 'SPA', // GROMING

  PRODUCT = 'PRODUCT',
  PT = 'PT' //  phẫu thuật
}

export class GroomingModel implements EntityModel {
    id?: string;
    seqNo: number;
    deleted: boolean;
    sync: boolean;
  
    name: string;
    price: number;
    extract: number;
    employerId: string;
    groupName: string;
    constructor(data: GroomingModel) {
      const clone: GroomingModel = {
        id: data.id,
        deleted: data.deleted,
        sync: data.sync,
        seqNo: data.seqNo,
        name: data.name || '',
        price: data.price || 0,
        extract: data.extract || 0 ,
        employerId: data.employerId || null,
        groupName: data.groupName || ''
      };
      Object.assign(this,clone );
    }
  }
// ca phẫu thuật
export class Surgery {
    surgeryName: string; // tên phẫu thuật
    surgeryCode: string;
    anesthetic: string ; // thuốc mê,
    quantity: string; // liều lượng,
    price: number;
    constructor(data: Surgery) {
      const clone: Surgery =  {
        surgeryName: data?.surgeryName || null,
        surgeryCode: data?.surgeryCode || null,
        anesthetic: data?.anesthetic || null,
        quantity: data?.quantity || null,
        price: data?.price || null
      }
      Object.assign(this, clone);
    }
  }

export class Vacxin {
    id: string;
    vacxinName: string; // tên vắc xin
    injectCount: number; // mũi tiêm
    doctorName: string; // bac si tiêm
    doctorId: string; // id bac sy tiêm
    currentDate: Date; // ngày tiêm vắc xin
    futureDate: Date; // ngày tái chủng
    sellingPrice: number;
    constructor(data: Vacxin, convertDate: (date: Date) => any) {
      const clone: Vacxin = {
        id: data.id,
        vacxinName: data.vacxinName,
        injectCount: data.injectCount,
        doctorName: data.doctorName,
        doctorId: data.doctorId,
        currentDate: convertDate(data.currentDate),
        futureDate: convertDate(data.futureDate),
        sellingPrice: data.sellingPrice
      }
      Object.assign(this, clone);
    }
  }

  export class Medicine {
    guide: string;
    sellingPrice: number;
    id: string;
    groupName: string;
    amount: number;
    displayName: string;
    name: string;
    unit: string;
    constructor(data: Medicine) {
      const clone: Medicine =  {
        guide: data.guide || null,
        sellingPrice: data.sellingPrice,
        id: data.id,
        groupName: data.groupName || null,
        amount:data.amount ,
        displayName: data.displayName || null,
        name: data.name || null,
        unit: data.unit || null
      }
      Object.assign(this, clone);
    }
  }
  export interface TestModel {
    id: string;
    name: string;
    result: string;
    reference: string;
    costPrice: number;
  }
export enum HotelType {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    HT = 'HT', // gửi thú cưng
    // eslint-disable-next-line @typescript-eslint/naming-convention
    DTNT = 'DTNT', // điều trị nội trú
    // eslint-disable-next-line @typescript-eslint/naming-convention
    NONE = 'NONE',
  }
export class PetHistoryModel implements EntityModel {
    id?: string;
    cageId: string;
    seqNo: number;
    deleted: boolean;
    sync: boolean;
    date: Date;
    temperature: number;
    weight: number;
    treatment: string;
    treatmentStr: string; // phần điều trị là free text nếu này có giá trị
    lesions: string;
    doctorId: string;
    type: HistoryType;
    // KB
    ngayTaiKham: Date;
    brandId: string;
    hotelType: HotelType;
    priceEstimate: number; // bao gồm giá khám bệnh và thuốc đi kèm
    serviceSale: number; // giá bán dịch vụ vd khám bệnh giá khám bênh là serviceSale chưa bao gồm thuốc đi kèm
    dateBooking: Date;
    idBooking: string;
    inPrice: boolean;
    noteByEmployee: string;
    symptoms: string;
    // Thông tin thể trạng và sức khỏe
    // DICH VU GROMING
    groomingServices: GroomingModel[];
    surgery: Surgery[] ;
    completedTime: Date; // thời gian hoàng thành thực tế,
    paid: number; // thánh toán trước, này cho mục lưu trú thú cưng đặt cọc
    customerId: string;
    petId: string;
    images: string[];
    medicines: Medicine[];
    medTolalSale: number; // tổng tiền thuốc sum Medicine
    test: TestModel[];
    vacxins: Vacxin[];
    createdBy: string;
    createAt: Date;
    billId: string;
    constructor(data: PetHistoryModel, convertDate: (date: Date) => any) {
      const clone: PetHistoryModel = {
        id: data.id,
        deleted: data.deleted,
        sync: data.sync,
        seqNo: data.seqNo,
        images: data.images || [],
        cageId: data.cageId || null,
        type: data.type || null,
        customerId: data.customerId || null,
        petId: data.petId || null,
        medicines: data.medicines || [],
        test: data.test || [],
        vacxins: data.vacxins || [],
        brandId: data.brandId || null,
        hotelType: data.hotelType || null,
        idBooking: data.idBooking || null,
        inPrice: data.inPrice || null,
        date: convertDate(data.date),
        temperature: data.temperature || null,
        weight: data.weight || null,
        treatment: data.treatment || null,
        treatmentStr: data?.treatmentStr || null,
        lesions: data.lesions ||  null,
        doctorId: data.doctorId || null,
        ngayTaiKham: convertDate(data.ngayTaiKham),
        priceEstimate: data.priceEstimate || 0,
        serviceSale: data.serviceSale || 0,
        medTolalSale: data.medTolalSale || 0,
        dateBooking: convertDate(data.dateBooking),
        noteByEmployee: data.noteByEmployee || null,
        symptoms :  data.symptoms ||  null,
        groomingServices: data.groomingServices || [],
        createdBy: data.createdBy || null,
        createAt: convertDate(data.createAt),
        billId: data.billId || null,
        completedTime: convertDate(data.completedTime),
        paid: data.paid || 0,
        surgery: data.surgery || [],
      };
      Object.assign(this,clone);
    }
  }