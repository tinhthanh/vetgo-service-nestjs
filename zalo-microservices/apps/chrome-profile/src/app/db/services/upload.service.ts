import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import FormData from 'form-data'; // Default import

@Injectable()
export class UploadService {
  private baseURL: string;
  private realm: string;
  constructor(protected httpService: HttpService,private readonly configService: ConfigService) {
    this.baseURL = this.configService.get<string>('URL_CURD');
    this.realm = this.configService.get<string>('REALM');
  }
  async uploadFile(buffer: Buffer, fileName: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', buffer, fileName);

    const headers = {
      'realm': this.realm,
      ...formData.getHeaders(),
    };

    const response = await lastValueFrom(
      this.httpService
        .post<{ url: string }>(
          `${this.baseURL}/public/api/files/upload`,
          formData,
          { headers }
        )
        .pipe(
          map((response) => {
            const it = response.data;
            const url = `${this.baseURL}${it.url}?realm=${this.realm}&review=true`;
            return url;
          })
        )
    );

    return response;
  }
}
