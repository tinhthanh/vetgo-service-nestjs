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

@Injectable()
export class SyncFirebaseService {
    private readonly logger = new Logger(SyncFirebaseService.name);
    private readonly  config = {
        "vetgo-01": {
          sheetId:
            "AKfycbwVPtWi1Sfx13sNtpSGqFBi4HBRQ1CyWCEcAtoHSPufR76xL4VJBkkIBpZ3DidWCzzT",
          firebase: {
            apiKey: "AIzaSyAOi_TN4at6W__9Jjzz31EEzMxQS5nf1s0",
            authDomain: "vetgo-01.firebaseapp.com",
            databaseURL:
              "https://vetgo-01-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "vetgo-01",
            storageBucket: "vetgo-01.appspot.com",
            messagingSenderId: "883303533949",
            appId: "1:883303533949:web:fcd2839a459ed1ae6e1014",
            measurementId: "G-TFR9L0R342",
          },
          retailer: "vetgo-01",
        },
      };
      constructor(
        private readonly firebase: FirebaseCurlService,
        private readonly firebaseAuth: FirebaseUtilService,
        private readonly githubService: GithubService,
        private readonly bot: TelegramService,
      ) {}
    async firebaseSyncJob() {
        for (const [key, value] of Object.entries(this.config)) {
            const url = value.firebase.databaseURL;
          // step 1 get token
         const token = await firstValueFrom(this.firebaseAuth.getToken(value.firebase.apiKey));
          this.logger.log("Token : " + token);
          // lấy ra danh sách các chi nhánh -> lấy đc ID từng chi nhánh
          try {
      
             const tables = [
              'BANK_ACCOUNTS',
              'BILLING',
              'BOOKING',
              'CAGE',
              'BRAND',
              'CUSTOMER',
              'HISTORY',
              // 'ORDERS_CODE',
              'PERMISSION_GROUP',
              'PET',
              'PRODUCT',
              'PurchaseOrder',
              'SETTING',
              'USERS',
              'suppliers'
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
               // TODO kiểm tra thời gian đã thự thi quá 4 phút thì tạo một trigger call lại hàm firebaseSyncJob
      
               // TODO mỗi brand chị được chạy chạy một lần trong ngày 
      
            //   const store = new StoreController();
              // B1 lấy seqNo từ github hub
              const gitseqNo = await this.githubService.getSeqNo( key ,table );
              this.logger.log(gitseqNo);
              if(gitseqNo === null) { // case init -> tạo mới lấy data từ fireabse insert vào github
                let countNullSeqNo = 0;
                let dataFirebase = await this.firebase.getBySeqNo( url,table, 0, token);
                 dataFirebase = dataFirebase.map((it, index) => { // thêm seqNo
                    if(!it.seqNo) {
                      countNullSeqNo++;
                      return {...it ,seqNo: new Date().getTime() + index } ;
                    }
                    return it;
                });
                 this.logger.log(`${key}/${table} case init patch ${countNullSeqNo} null seqNo`);
                this.bot.pingFirebase(`${key}/${table} case init patch ${countNullSeqNo} null seqNo`);
                // path file
                const file = await this.saveMap(key, table, dataFirebase);

                // save  driver to github
                const blob = await this.getFileBytes(file);
              await this.githubService.commitContent(blob, `${key}/${table}`);
                // save array driver to github
                this.logger.log(`---- ${table}_array 1`);
                const fileArray = await this.saveAny(key, `${table}_array`, this.convertObjectsToArray(Object.values(dataFirebase)));
                const blobArray = await this.getFileBytes(fileArray);
              await this.githubService.commitContent(blobArray , `${key}/${table}_array`);
                this.logger.log(`---- ${table}_array 2`);
                // init map -> maxSeqNo , total dataa
                const maxSeqNo = Math.max(
                  0,
                  ...dataFirebase.map((it) => Number(it.seqNo || 0))
                );
                const mapStr = {
                  seqNo: maxSeqNo,
                  total: dataFirebase.length,
                  lastUpdated: new Date().toISOString()
                }
                await this.githubService.commitJson( JSON.stringify(mapStr) ,`${key}/${table}_map`);
                // update all data firebase to github
              } else {
                // case cập nhật thêm vào
                 this.logger.log(`${key}/${table} case câp nhật từ firebase to github`);
                this.bot.pingFirebase(`${key}/${table} case cập nhật từ firebase to github`);
                 this.logger.log(`${key}/${table} Github data seqNo ${gitseqNo.seqNo}`);
                this.bot.pingFirebase(`${key}/${table} Github data seqNo ${gitseqNo.seqNo}`);
                  // lấy mới từ firebase theo seqNo
                  const dataFirebase = await this.firebase.getBySeqNo(url,table, gitseqNo.seqNo, token);
                  // cập nhật sag vào github
                  if(dataFirebase.length > 0) { // có dữ liệu cần cập nhật 
                     this.logger.log(`${key}/${table} có dữ liệu cần cập nhật ${dataFirebase.length}`);
                    this.bot.pingFirebase(`${key}/${table} có dữ liệu cần cập nhật ${dataFirebase.length}`);
                    // lấy hết data từ github , concat data firebase với data github
                    const tableKeyValue = await this.githubService.getTable(key, table); // { key: value}
                     this.logger.log(`${key}/${table} before change ${Object.keys(tableKeyValue).length}`);
                    let update = 0 ;
                    let create = 0;
                    for (const item of dataFirebase) {
                      if(tableKeyValue[item.id]) {
                         if(!_.isEqual(tableKeyValue[item.id],item )) {
                          tableKeyValue[item.id] = item;
                          update++;
                         }
                      } else {
                        tableKeyValue[item.id] = item;
                        create++;
                      }
                    }
                     this.logger.log(`${key}/${table} affter change update ${update} create ${create}`);
                    this.bot.pingFirebase(`${key}/${table} affter change update ${update} create ${create}`);
                    // save file to google driver
                    if( (create + update) > 0) {
                        // paath
                      const file = await this.saveMap(key, table, tableKeyValue);
                      const fileBlob = await this.getFileBytes(file);
                       this.logger.log(`${key}/${table} save file to google driver`);
                      // save  driver to github
                      await this.githubService.commitContent(fileBlob, `${key}/${table}`);
                      // save araray to github
                      
                      const fileArray =  await this.saveAny(key, `${table}_array`, this.convertObjectsToArray(Object.values(tableKeyValue)));
                      const fileArrayBlob = await this.getFileBytes(fileArray);
                     await this.githubService.commitContent(fileArrayBlob , `${key}/${table}_array`);
      
                       this.logger.log(`${key}/${table} save driver to github`);
                      this.bot.pingFirebase(`${key}/${table} save driver to github`);
          
                      const maxSeqNo = Math.max(
                        0,
                        ...Object.values(dataFirebase).map((it) => Number(it.seqNo || 0))
                      )
                      // cập nhật map trong github
                      const mapStr = {
                        seqNo: maxSeqNo,
                        total: Object.values(tableKeyValue).length,
                        lastUpdated: new Date().toISOString()
                      }
                      this.logger.log(' mapStr -> ', mapStr);
                    await this.githubService.commitJson( JSON.stringify(mapStr) ,`${key}/${table}_map`);
                       this.logger.log(`${key}/${table} cập nhật map trong github`);
                      this.bot.pingFirebase(`${key}/${table} cập nhật map trong github`);
                    } else {
                       this.logger.log('Khong co du lieu can cap nhat');
                      this. bot.pingFirebase('Khong co du lieu can cap nhat');
                    }
                    
                  } else {
                     this.logger.log('Khong co du lieu can cap nhat');
                    this. bot.pingFirebase('Khong co du lieu can cap nhat');
                  }
              }
            }
          } catch (e) {
             this.logger.log(e);
            this.bot.pingFirebase(`Error brand ${key} ${e}`);
          }
        }
        return ;
      }    
      async saveAny(databaseName: string, tableName: string, data: any): Promise<string> {
        // Xác định đường dẫn của file dựa trên databaseName và tableName
        const directoryPath = path.join('./data', databaseName);
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
       convertObjectsToArray(objects) {
        // Bước 1: Tạo một Set để lưu trữ tất cả các khóa duy nhất
        const allKeys = new Set();
        objects.forEach(obj => {
          Object.keys(obj).forEach(key => {
            allKeys.add(key);
          });
        });
      
        // Bước 2: Chuyển Set thành mảng và đây sẽ là dòng đầu tiên trong mảng kết quả
        const keysArray = Array.from(allKeys);
        const resultArray = [keysArray];
      
        // Bước 3: Chuyển từng đối tượng thành một mảng
        objects.forEach((obj: any) => {
          const row = keysArray.map((key: string) => obj[key] === undefined ? null : obj[key]);
          resultArray.push(row);
        });
      
        return resultArray;
      }
}