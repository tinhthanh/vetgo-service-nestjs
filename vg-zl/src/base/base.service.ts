import { EntityModel } from './base.type';
import * as path from 'path';
const fs = require('fs');
import { promisify } from 'util';
const unlink = promisify(fs.unlink);

export abstract class BaseService<T extends EntityModel> {
  private data: { [phone: string]: T[] } = {}; // In-memory map
  private tableName: string;
  private filePath: string = './data';

  constructor(tableName: string) {
    this.tableName = tableName;
  }
  getTableName() {
    return this.tableName;
  }

  // Lấy tất cả dữ liệu từ bộ nhớ hoặc từ file nếu chưa có trong bộ nhớ
  async getAll(phone: string): Promise<T[]> {
    if (this.data[phone]) {
      console.warn(phone);
      console.warn('return form cache ',  this.data);
      return this.data[phone]; // Trả về từ bộ nhớ
    } else {
      // Xác định đường dẫn file
      const directoryPath = path.join(this.filePath, phone);
      const filePath = path.join(directoryPath, `${this.tableName}.json`);

      // Kiểm tra file tồn tại hay không
      if (fs.existsSync(filePath)) {
        try {
          // Đọc dữ liệu từ file
          const jsonData = fs.readFileSync(filePath, 'utf-8');

          // Chuyển đổi dữ liệu JSON thành đối tượng
          const data: T[] = JSON.parse(jsonData);

          // Lưu dữ liệu vào bộ nhớ và trả về
          this.data[phone] = data || [];
          console.warn('return form file ', data.length);
          return data;
        } catch (error) {
          console.error('Error while reading the file:', error);
          throw error;
        }
      } else {
        // Nếu file không tồn tại, trả về mảng rỗng
        return [];
      }
    }
  }

  // Lưu tất cả dữ liệu vào file JSON
  async saveAll(phone: string, data: T[]): Promise<string> {
    this.data[phone] = data;

    const directoryPath = path.join(this.filePath, phone);
    const filePath = path.join(directoryPath, `${this.tableName}.json`);

    const jsonString = JSON.stringify(data);

    try {
      // Kiểm tra nếu 'directoryPath' tồn tại nhưng là một file, thì xóa nó
      if (fs.existsSync(directoryPath) && !fs.lstatSync(directoryPath).isDirectory()) {
        await unlink(directoryPath); // Xóa file nếu tồn tại
      }

      // Tạo thư mục nếu chưa tồn tại
      fs.mkdirSync(directoryPath, { recursive: true });

      // Xóa file cũ nếu tồn tại
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
      }

      // Tạo file mới với dữ liệu JSON
      fs.writeFileSync(filePath, jsonString, 'utf-8');

      return filePath;
    } catch (error) {
      console.error('An error occurred while saving:', error);
      throw error;
    }
  }
}
