import { Injectable } from "@nestjs/common";
import { BaseService } from "../../base/base.service";
import { MessageModel } from "../models/message.model";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";
// chi tiết cuộc trò truyện với một user bất kỳ
@Injectable()
export class ConversationService extends BaseService<MessageModel> {
  private baseURL: string;
  private realm: string;
    constructor( protected httpService: HttpService, private readonly configService: ConfigService) {
      super("CONVERSATION");
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
     async getAllRemote(avt: string,phone: string): Promise<MessageModel[]> {
      const url = `${this.baseURL}/public/api/dynamic/table/P_${phone}_${this.getTableName()}/${avt}}`;
      const response = await lastValueFrom(this.httpService.get(url, this.getHeaders()));
      if (response.status === 200) {
         if(response.data.error && response.data.status) {
            return [];
         }
        return response.data.data;
      }
      return [];
    }

    async addRemote(avt: string,phone: string,data: MessageModel[]): Promise<void> {
      const newModel = { id: avt,data, seqNo: new Date().getTime() };
      const url = `${this.baseURL}/public/api/dynamic/table/P_${phone}_${this.getTableName()}/insert`;
      const response = await lastValueFrom(this.httpService.post(url, newModel, this.getHeaders()));
      if (response.status === 201) {
        console.log('save to remote done');
      }
    }
      async getAllConversation( avt: string,phone: string): Promise<MessageModel[]> {
        // TODO nếu local không có thì đi kéo trên server về
        try {
          const remoteList = await this.getAllRemote(avt,phone);
          console.warn(remoteList);
        } catch {
          // phong truog hop server chet van tra ve du lieu o may
        }
        // TODO lay local , co thi call len server tim
        return super.getAll(avt);
    }
    async saveAllConversation(avt: string, phone: string, data: MessageModel[]): Promise<string> {
          try {
            await this.addRemote(avt, phone , data);
          } catch (e) {
            console.warn('save lỗi', e);
          }
        return super.saveAll(avt, data);
    }
}
