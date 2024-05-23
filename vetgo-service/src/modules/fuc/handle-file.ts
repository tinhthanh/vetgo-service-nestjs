
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';
const gzip = promisify(zlib.gzip);
const fs = require('fs');
const unlink = promisify(fs.unlink);
import { readFile, writeFile } from 'fs/promises';
export function saveMap(databaseName : string , tableName: string , data : any[]) {
    if(Array.isArray(data)) {
      data = data.reduce((pre , curr) => {
         pre[curr.id] = curr;
        return pre;
      }, {});
    }
   return saveAny(databaseName,tableName,data);
  }
/**
 * Reads the content of a file and returns it as a Buffer.
 *
 * @param {string} filePath - The path to the file to read.
 * @return {Promise<Buffer>} A promise that resolves to the file content as a Buffer.
 */
export async function getFileBytes(filePath: string): Promise<Buffer> {
    const buffer = await readFile(filePath);
    return buffer;
  }

/** mục đích giảm dụng lượng đối tượng
 * chuyển một danh sách object thành danh sách mảng vd [{userName:"Thanh" ,phone:"123"}] -> [["userName" , "phone"], ["Thanh" ,"123"]]
 * @param {Array<{[key: string]: any}>} objects - The array of objects to be converted.
 * @return {Array<Array<any>>} - The converted two-dimensional array.
 */
export function convertObjectsToArray(objects: {[key: string]: any}[]) {
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
  /**
 * 
 *  nén đối tượng json thành zip và save xuống thư mục ./data
 * @param {string} databaseName - The name of the database.
 * @param {string} tableName - The name of the table.
 * @param {any} data - The data to be saved.
 * @return {Promise<string>} A promise that resolves to the file path of the created file.
 */
export async function saveAny(databaseName: string, tableName: string, data: object): Promise<string> {
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