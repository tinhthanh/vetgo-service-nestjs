import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, of } from 'rxjs';
import * as zlib from 'zlib';
import * as util from 'util';
import { AxiosError } from 'axios';
const gunzip = util.promisify(zlib.gunzip);
import { ConfigService } from '@nestjs/config';
@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(private readonly httpService: HttpService , private readonly configService: ConfigService) {}

  private async fetchGithubContent(path: string, raw: boolean = false): Promise<any> {
    const url = `https://api.github.com/repos/${this.configService.get('GITHUB_OWNER')}/${this.configService.get('GITHUB_REPO')}/contents/${path}`;
    const headers = {
      'Authorization': `token ${this.configService.get('GITHUB_TOKEN')}`,
      'Accept': raw ? 'application/vnd.github.v3.raw' : 'application/json'
    };
    try {
      const response = await lastValueFrom(this.httpService.get(url, { headers, responseType: raw ? 'arraybuffer': 'json' }).pipe(
        catchError((error: AxiosError) => {
          if(error.response && error.response.status === 404) {
            return of({data: null});
          }
          this.logger.error(error.response.status);
          throw 'An error happened!';
        })
      ));
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching from GitHub: ${error.message}`);
      throw error;
    }
  }
  // Chỉ lấy file json từ github
  private async fetchGithubJson(path: string, raw: boolean = false): Promise<any> {
    const url = `https://api.github.com/repos/${this.configService.get('GITHUB_OWNER')}/${this.configService.get('GITHUB_REPO')}/contents/${path}`;
    const headers = {
      'Authorization': `token ${this.configService.get('GITHUB_TOKEN')}`,
      'Accept': 'application/vnd.github.v3.raw'
    };
    try {
      const response = await lastValueFrom(this.httpService.get(url, { headers }).pipe(
        catchError((error: AxiosError) => {
          if(error.response && error.response.status === 404) {
            return of({data: null});
          }
          this.logger.error(error.response.status);
          throw 'An error happened!';
        })
      ));
      return  response.data;
    } catch (error) {
      this.logger.error(`Error fetching from GitHub: ${error.message}`);
      throw error;
    }
  }
  // commit 1 file qua github
  private async commitToGithub(content: Buffer | string, path: string): Promise<any> {
    const url = `https://api.github.com/repos/${this.configService.get('GITHUB_OWNER')}/${this.configService.get('GITHUB_REPO')}/contents/${path}`;
    const message = new Date().toISOString();
    const branchName = 'main';
    const base64Content = content.toString('base64');

    let data = {
      message,
      content: base64Content,
      branch: branchName
    };

    // Check if the file already exists
    const currentContent = await this.fetchGithubContent(path);
  
    if (currentContent && currentContent.sha) {
      data['sha'] = currentContent.sha; // If exists, provide the SHA to update the file
    }

    const headers = {
      'Authorization': `token ${this.configService.get('GITHUB_TOKEN')}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await lastValueFrom(this.httpService.put(url, data, { headers }));
      return response.data;
    } catch (error) {
      this.logger.error(`Error committing to GitHub: ${error.message}`);
      throw error;
    }
  }

  async getSeqNo(retailer: string, table: string): Promise<any> {
    const path = `${retailer}/${table}_map`;
    return this.fetchGithubJson(path, true);
  }

  async getTable(retailer: string, table: string): Promise<any> {
    const path = `${retailer}/${table}`;
    const content = await this.fetchGithubContent(path, true);
    if (content) {
      const unzippedBuffer = await gunzip(content);
      // Chuyển buffer thành JSON
      const json = JSON.parse(unzippedBuffer.toString());
      return json;
    }
    return null;
  }

  async commitContent(content: Buffer | string, path: string): Promise<any> {
    return this.commitToGithub(content, path);
  }
  async commitJson(content: string, path: string): Promise<any> {
    return this.commitToGithub(this.base64Encode(content), path);
  }
   base64Encode(str: string): string {
    return Buffer.from(str).toString('base64');
  }
}