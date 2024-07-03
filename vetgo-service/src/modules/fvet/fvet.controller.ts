import { Controller, Get, Logger } from "@nestjs/common";
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { CustomerModel } from "./models/customer.model";
import { parse } from 'date-fns';
import { PetModel } from "./models/pet.model";
import { HistoryType, PetHistoryModel } from "./models/pet-history.model";
import { UserModel } from "./models/user.model";
import { GithubService } from "../github/github.service";
import { convertObjectsToArray, getFileBytes, saveAny, saveMap } from "../fuc/handle-file";
@Controller('fvet')
export class FvetController {
    constructor(  private readonly githubService: GithubService) {}
    // server nay de convert data tu fvet sang json
    @Get('convert-data')
    async convertData() {
        // TODO đọc file ở .zip ở thư mục petplus/phieukham.rar thu mục này cùng cấp với src
        // trong thư mục này có nhiều file json  

        const listPet: any[] = await this.readExcelFile(path.join('./petplus/input', 'thu-cung.xlsx'), 4);
        const mListPet = listPet.reduce((pre, curr, index) => {
            const pet: Partial<PetModel> = {
                id: curr['Mã thú cưng'] ,
                seqNo: new Date().getTime() + index,
                name: curr['Tên thú cưng'] || null,
                birthDay: convertDateStringToDateObject(curr['Ngày sinh'],'dd/MM/yyyy'),
                breed: curr['Giống'] || null,
                species: curr['Loài vật'] || null,
                sex: null, // bo sung
                code: curr['Mã số chip'] || null, // barchip
                customerId: null , // bo sung
                qrCode: curr['Mã thú cưng'],
                spaying: curr['Triệt sản'] === 'Có' , // triet san
                birthdayTyping: false,
                createAt: convertDateStringToDateObject(curr['Ngày tạo']),
                petColors: curr['Màu sắc'] || null,
                weight: curr['Cân nặng'] || null,
            } 
            pre[pet.id] = pet;
            return pre;
        }, {});
        // end pet
        // cus
        const listCus: any[] = await this.readExcelFile(path.join('./petplus/input', 'khach-hang.xlsx'), 4);
        const mListCus =  (listCus || []).reduce((pre, curr, index) => {
            const key =  String(curr['Điện thoại']);
          const isPhone =   /((09|03|07|08|05)+([0-9]{8})\b)/g.test((key || '').replace(/[().]/g, ""))  || /((02)+([0-9]{9})\b)/g.test((key || '').replace(/[().]/g, ""));
           if(isPhone) {
            const c: Partial<CustomerModel> = {
                id: key,
                seqNo: new Date().getTime() + index,
                fullName: curr['Họ tên'],
                phone: key,
                address: curr['Địa chỉ'],
                addressFullText: curr['Địa chỉ'],
                brandId:'B1',
                sex: curr['Giới tính'] === 'Nữ' ? 'FEMALE' : 'MALE',
                createAt: convertDateStringToDateObject(curr['Ngày tạo'])
                }
                 pre[key] = c;
           }
        return pre;
      }, {});
      // end cus
      // phieu kham
      const listPhieuKham: PhieuKham[] = JSON.parse(await readFile(path.join('./petplus/input', 'phieukham.json'), {encoding : 'utf8'}));
      console.log(listPhieuKham.length);
      const listPhieuKham1: PhieuKham[] = JSON.parse(await readFile(path.join('./petplus/input', 'phieukham1.json'), {encoding : 'utf8'}));
      console.log(listPhieuKham1.length);

      const listPhieuKham2: PhieuKham[] = JSON.parse(await readFile(path.join('./petplus/input', 'phieukham2.json'), {encoding : 'utf8'}));
      console.log(listPhieuKham2.length);

      // const mUser = {};
      const mListPieuKham  = listPhieuKham.concat(listPhieuKham1).concat(listPhieuKham2).reduce((pre, curr, index) => {
        const pet = mListPet[curr.mathucung.mathucung];
        const cus = mListCus[curr.thongtinkhachhang.sodienthoai];
        if( cus && pet ) {
            mListPet[curr.mathucung.mathucung] = {...mListPet[curr.mathucung.mathucung],customerId: curr.thongtinkhachhang.sodienthoai }
            // pet.customerId = cus.id;
            // const u: Partial<UserModel> = {
            //     id: String(curr.bacsi.id),
            //     seqNo: new Date().getTime() + index,
            //     passport: '9999',
            //     displayName: curr.bacsi.ten,
            //     date: new Date(),
            //     uid: null,
            //     address: 'HCM',
            //     role: 'ADMIN',
            //     active:  true,
            //     brandId: 'B1',
            // }
            // if(curr.bacsi.id) {
            //     mUser[u.id] = u;
            // }
            const p: Partial<PetHistoryModel> = {
                id: curr.maphieukham,
                seqNo: new Date().getTime() + index,
                date: convertDateStringToDateObject(curr.ngaytao , 'dd/MM/yyyy') ,
                weight: pet.weight,
                doctorId: 'ADMIN',
                type: HistoryType.KB,
                // KB
                brandId: 'B1',
                symptoms: curr.chandoansobo,
                // Thông tin thể trạng và sức khỏe
                // DICH VU GROMING
                customerId: curr.thongtinkhachhang.sodienthoai,
                petId:  curr.mathucung.mathucung,
                createdBy: curr.bacsi.ten,
                createAt:  convertDateStringToDateObject(curr.ngaytao , 'dd/MM/yyyy') 
            };
            pre[p.id] = p;
            
        }
       
        return pre;  
      }, {});
      console.log('total' , Object.keys(mListPieuKham).length);

       const list = [
                {table: 'CUSTOMER', data: Object.values(mListCus)},
                {table: 'PET', data:  Object.values(mListPet)},
                {table: 'HISTORY', data:  Object.values(mListPieuKham)},
            ];
        for(const item of list) { 
            await this.syncGithub('petplus2025',item.table, item.data);
        }
        console.log('done');
      // save file qua github
        try {
          // save khach hang
          // const khachHangJson = path.join('./petplus', 'customer.json');
        //   await writeFile(path.join('./petplus/out', 'customer.json'), JSON.stringify(mListCus, null, 2), 'utf8');
        //   await writeFile(path.join('./petplus/out', 'pets.json'), JSON.stringify(mListPet, null, 2), 'utf8');
        //   await writeFile(path.join('./petplus/out', 'history.json'), JSON.stringify(mListPieuKham, null, 2), 'utf8');
        //   await writeFile(path.join('./petplus/out', 'user.json'), JSON.stringify(mUser, null, 2), 'utf8');
          // TODO save thong tin thu cung

         // save thong tin phieu kham
          return [];
        } catch (error) {
          throw new Error(error);
        }
    }
    readExcelFile(filePath:string ,range : number ): any {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
    
        // Chỉ định dòng bắt đầu của header là 5
        const json = XLSX.utils.sheet_to_json(sheet, { range });
        return json;
      }
      async syncGithub( retailer: string,table: string , list: any[]) {
        list = list.map((it, index) => { // thêm seqNo
            if(!it.seqNo) {
              return {...it ,seqNo: new Date().getTime() + index } ;
            }
            return it;
        });
    
        const file = await saveMap(retailer, table, list);
    
        // save  driver to github
        const blob = await getFileBytes(file);
      await this.githubService.commitContent(blob, `${retailer}/${table}`);
        // save array driver to github
        const fileArray = await saveAny(retailer, `${table}_array`, convertObjectsToArray(list));
        const blobArray = await getFileBytes(fileArray);
      await this.githubService.commitContent(blobArray , `${retailer}/${table}_array`);
        // init map -> maxSeqNo , total dataa
        const maxSeqNo = Math.max(
          0,
          ...list.map((it) => Number(it.seqNo || 0))
        );
        const mapStr = {
          seqNo: maxSeqNo,
          total: list.length,
          lastUpdated: new Date().toISOString()
        }
        await this.githubService.commitJson( JSON.stringify(mapStr) ,`${retailer}/${table}_map`);
      }
}
const convertDateStringToDateObject = (dateString: string,format = 'dd/MM/yyyy HH:mm:ss'): Date =>  {
    try {
        const dateObject = parse(dateString, format, new Date());
        return dateObject;
    } catch (error) {
        return null;
    }
  }
export interface PhieuKham {
    maphieukham: string;
    ngaytao: string; //"16/11/2022"
    mathucung: {
        mathucung: string; // P010486 -> map file excel
    },
    thongtinkhachhang: {
        makhachhang: string; // KH008507 -> map file excel
        sodienthoai: string;
    },
    bacsi: {
        id: string;
        ten: string;
    },
    chandoansobo: string;
}