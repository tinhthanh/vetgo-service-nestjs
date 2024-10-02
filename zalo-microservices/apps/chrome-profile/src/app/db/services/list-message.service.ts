import { Injectable } from "@nestjs/common";
import { BaseService } from "../../base/base.service";
import { ContactModel } from "../models/contact.model";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";

@Injectable()
export class ListMessageService extends BaseService<ContactModel> {
  private baseURL: string;
  private realm: string;
    constructor( protected httpService: HttpService, private readonly configService: ConfigService) {
      super("MESSAGES");
      this.baseURL = this.configService.get<string>('URL_CURD');
      this.realm = this.configService.get<string>('REALM');
    }
    private getHeaders() {
      return {
        headers: {
          realm: this.realm,
        },
      };
    }
      // lấy từ server table crud
      async getAllRemote(phone: string): Promise<ContactModel[]> {
        const url = `${this.baseURL}/public/api/dynamic/table/P_${phone}/${this.getTableName()}`;
        const response = await lastValueFrom(this.httpService.get(url, this.getHeaders()));
        if (response.status === 200) {
           if(response.data.error && response.data.status) {
              return [];
           }
          return response.data.data;
        }
        return [];
      }

      async addRemote(phone: string,data: ContactModel[]): Promise<void> {
        const newModel = { id: this.getTableName(),data, seqNo: new Date().getTime() };
        const url = `${this.baseURL}/public/api/dynamic/table/P_${phone}/insert`;
        const response = await lastValueFrom(this.httpService.post(url, newModel, this.getHeaders()));
        if (response.status === 201) {
          console.log('save to remote done');
        }
      }
       override async getAll(phone: string): Promise<ContactModel[]> {
          // TODO nếu local không có thì đi kéo trên server về
          try {
            const remoteList = await this.getAllRemote(phone);
            console.warn(remoteList);
          } catch {
            // phong truog hop server chet van tra ve du lieu o may
          }

          return super.getAll(phone);
      }
      override async saveAll(phone: string, data: ContactModel[]): Promise<string> {
            try {
              await this.addRemote(phone , data);
            } catch (e) {
              console.warn('save lỗi', e);
            }
          return super.saveAll(phone, data);
      }

}
