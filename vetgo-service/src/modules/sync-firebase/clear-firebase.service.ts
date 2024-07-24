import { Injectable, Logger } from "@nestjs/common";
import { TelegramService } from "../telegram/telegram.service";
import { GithubService } from "../github/github.service";
import { FirebaseCurlService } from "../firebase/firebase-curl.service";
import { FirebaseUtilService } from "../firebase/firebase-util.service";
import { readFile } from 'fs/promises';
import * as path from 'path';
import  * as _ from 'lodash'
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

import * as zlib from 'zlib';
import { promisify } from 'util';
import { firstValueFrom } from "rxjs";

const gzip = promisify(zlib.gzip);
const unlink = promisify(fs.unlink);
export const enumRetailer = {
  woo: 'woo',
  pkvetgo: 'pkvetgo', // for only demo
  phathuy: 'phathuy',
  diamond : 'diamond-vet',
  moonPet: 'moon-pet',
  thapcham: 'thapcham-vetgo',
  petshop : 'petshop-vet',
  petplus : 'petplus',
  petland : 'petland',
  vetgo01 : 'vetgo-01'
}
@Injectable()
export class ClearFirebaseService {
    private readonly logger = new Logger(ClearFirebaseService.name);
    private readonly  config = {
        'petplus2025': {
          firebase: {
            apiKey: "AIzaSyCEb0Gmc3Ull2ENRp78H6MUWOYFnF1iTVo",
            authDomain: "petplus2025.firebaseapp.com",
            databaseURL: "https://petplus2025-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "petplus2025",
            storageBucket: "petplus2025.appspot.com",
            messagingSenderId: "329671720857",
            appId: "1:329671720857:web:6666065878760afbafdd08",
            measurementId: "G-WPENH7P36Z"
          },
          retailer: 'petplus2025',
          sheetId: "AKfycbwoR88HlfAJ0o0hFapH_NfhbRBlwlk1GSEnk60SAO7LXqHFATwZwDdc95Uu5TL-2FJq"
        }
      };
    // private readonly  config = {
    //   [enumRetailer.petplus]: {
    //     sheetId: "AKfycbxksjNgYZWqAeHWERQiXbyGh5Q8wsTfMVpJ49sZKe7dCELlxe7LIq_OFyXk0HSJmQKb",
    //     firebase: {
    //       apiKey: "AIzaSyDdKB4XXkT7sAcTTZh1Ep9_baxiabZ7jJs",
    //       authDomain: "petplus-vet.firebaseapp.com",
    //       databaseURL: "https://petplus-vet-default-rtdb.asia-southeast1.firebasedatabase.app",
    //       projectId: "petplus-vet",
    //       storageBucket: "petplus-vet.appspot.com",
    //       messagingSenderId: "1033394551475",
    //       appId: "1:1033394551475:web:5b7493a4d4075f391e0ec6",
    //       measurementId: "G-96FTV4MEDV"
    //     },
    //     retailer: enumRetailer.petplus
    //    }
    // };
      constructor(
        private readonly firebase: FirebaseCurlService,
        private readonly firebaseAuth: FirebaseUtilService,
        private readonly githubService: GithubService,
        private readonly bot: TelegramService,
      ) {}
    async removeData() {
        for (const [key, value] of Object.entries(this.config)) {
            const url = value.firebase.databaseURL;
          // step 1 get token]
          this.logger.debug("key : " + key);
          this.logger.debug("url : " + url);
         const token = await firstValueFrom(this.firebaseAuth.getToken(value.firebase.apiKey));
          this.logger.log("Token : " + token);
          // lấy ra danh sách các chi nhánh -> lấy đc ID từng chi nhánh
          try {
      
             const tables = [
              'BANK_ACCOUNTS',
              'BILLING',
              'BOOKING',
              'CAGE',
              // 'BRAND',
              'CUSTOMER',
              'HISTORY',
              // 'ORDERS_CODE',
              // 'PERMISSION_GROUP',
              'PET',
              'PRODUCT',
              'PurchaseOrder',
              // 'SETTING',
              // 'USERS',
              'suppliers',
              'CASHFLOW',
              'DEPOSIT',
              'MEDICAL_RECORD',
              'ORDER_RETURN',
              // CHAM CONG
              'SHIFT_DIVISION',
              'WORKING_SCHEDULE',
              'TIMEKEEPING',
              'SHIFT',
              'TIMEKEEPING_REQUEST',
              'SETTING_TIMEKEEPING',
              'RECEIPT_PAYMENT'
            ];
            // addd thêm các table order
             const brands = await this.firebase.getBySeqNo(url,'BRAND', 0, token);
              for (let i = 0; i < brands.length; i++) { 
                  const brand = brands[i];
                  const year = new Date().getFullYear();
                for (let j = 2023; j <= year; j++) {
                   const table = `ORDERS_${brand.id}_${j}`;
                   tables.push(table);
                }
              }
               this.logger.log(tables);
            for(const table of tables) {
                  // lấy mới từ firebase theo seqNo
                  const dataFirebase = await this.firebase.getBySeqNo(url,table,0, token);
                  // cập nhật sag vào github

                  if(dataFirebase.length > 0) { // có dữ liệu cần cập nhật 
                     this.logger.log(`${key}/${table} data firese ${dataFirebase.length}`);
                    const tableKeyValue = await this.githubService.getTable(key, table); // { key: value}
                    let update = 0 ;
                    let create = 0;
                    const itemRemove = [];
                    for (const item of dataFirebase) {
                      if(tableKeyValue[item.id]) {
                         if(!_.isEqual(tableKeyValue[item.id],item )) {
                          tableKeyValue[item.id] = item;
                          update++;
                         } else {
                          // TODO remove
                          if(item.id) {
                            itemRemove.push(item.id);
                          }
                         }
                      } else {
                        tableKeyValue[item.id] = item;
                        create++;
                      }
                    }
                    // remove
                    await this.firebase.deleteByIds(url,table, itemRemove,token);
                    // for( const it of itemRemove) {
                    //   if(it.id ) {
                    //   const rs =  await this.firebase.deleteById(url,table,it.id , token ); 
                    //     if(!rs.status) {
                    //       this.logger.error('loi roi');
                    //       break;
                    //     }
                    //   } else {
                    //     this.logger.log('Khong co id');
                    //   }
                    // }
                     this.logger.log(`${key}/${table} can remove ${itemRemove.length}`);
                     this.logger.log(`${key}/${table} khac biet ${(create + update) }`);
                    // save file to google driver
                    // if( (create + update) > 0) {
                    //     // paath
                    //   const file = await this.saveMap(key, table, tableKeyValue);
                    //    this.logger.log(`${key}/${table} save driver to github`);
                    // } else {
                    //    this.logger.log('Khong co du lieu can cap nhat');
                    // }
                    
                  } else {
                     this.logger.log('Khong co du lieu can cap nhat');
                  }
            }
          } catch (e) {
             this.logger.log(e);
            this.bot.pingFirebase(`Error brand ${key} ${e}`);
          }
          this.logger.log("done");
        }
        return ;
      }    
      async saveAny(databaseName: string, tableName: string, data: any): Promise<string> {
        // Xác định đường dẫn của file dựa trên databaseName và tableName
        const directoryPath = path.join('./data/removed', databaseName);
        const filePath = path.join(directoryPath, `${tableName}`);
        
        // Tạo chuỗi JSON từ dữ liệu
        const jsonString = JSON.stringify(data);
        
        try {
          // Nén dữ liệu
          const buffer = await gzip(Buffer.from(jsonString, 'utf-8'));
          
          // Chắc chắn thư mục tồn tại
          fs.mkdirSync(directoryPath, { recursive: true });
    
          // Xóa file cũ nếu tồn tại
          if (fs.existsSync(filePath)) {
            await unlink(filePath);
          }
          
          // Tạo file mới với dữ liệu nén
          fs.writeFileSync(filePath, buffer);
          
          // Trả về thông tin file đã tạo
          return filePath;
        } catch (error) {
          console.error('An error occurred:', error);
          throw error;
        }
      }
      // This function reads a file and returns its byte array
      async getFileBytes(filePath: string): Promise<Buffer> {
        const buffer = await readFile(filePath);
        return buffer;
      }
      saveMap(databaseName : string , tableName: string , data : any[]) {
        if(Array.isArray(data)) {
          data = data.reduce((pre , curr) => {
             pre[curr.id] = curr;
            return pre;
          }, {});
        }
       return this.saveAny(databaseName,tableName,data);
      }
}