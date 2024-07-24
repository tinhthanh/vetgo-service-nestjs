import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
export interface EntityModel {
    id?: string;
    seqNo?: number;
}

@Injectable()
export class FirebaseCurlService {
  private readonly logger = new Logger(FirebaseCurlService.name);
  constructor(private readonly httpService: HttpService) {}
  async addAll<T extends EntityModel>(firebaseUrl: string,table: string, list: T[]): Promise<T[]> {
    const path = `/${table}.json?orderBy="seqNo"&startAt=0`;
    let currentData;
    try {
      const response = await lastValueFrom(this.httpService.get(firebaseUrl + path, {
        headers: {
          'Content-Type': 'application/json'
        }
      }));
      currentData = response.data;
    } catch (error) {
      this.logger.error('Failed to fetch current data', error);
      return [];
    }

    const data = list.map((item, index) => ({
      ...item, seqNo: new Date().getTime() + index
    })).reduce((acc, curr) => {
      const id = curr.id || uuidv4();
      acc[id] = curr;
      if (currentData && currentData[id]) {
        delete currentData[id];
      }
      return acc;
    }, {});

    try {
      const response = await lastValueFrom(this.httpService.put(firebaseUrl + path, {
        ...currentData, ...data
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      }));
      return response.data;
    } catch (error) {
      this.logger.error('Failed to add all data', error);
      throw error;
    }
  }

  async getAll<T>(firebaseUrl: string,table: string): Promise<T[]> {
    const path = `/${table}.json`;
    try {
      const response = await lastValueFrom(this.httpService.get(firebaseUrl + path, {
        headers: {
          'Content-Type': 'application/json'
        }
      }));
      return Object.values(response.data || {});
    } catch (error) {
      this.logger.error('Failed to get all data', error);
      return [];
    }
  }

  async getBySeqNo<T extends EntityModel>(firebaseUrl: string,table: string, maxSeqNo = 0, accessToken?: string): Promise<T[]> {
    let path = `/${table}.json?orderBy="seqNo"&startAt=${maxSeqNo}`;
    if (accessToken) {
      path += `&auth=${accessToken}`;
    }
    if (maxSeqNo === 0) {
      path = accessToken ? `/${table}.json?auth=${accessToken}` : `/${table}.json`;
    }

    try {
      const response = await lastValueFrom(this.httpService.get(firebaseUrl + path, {
        headers: {
          'Content-Type': 'application/json'
        }
      }));
      if (response.data && Object.keys(response.data).length === 1 && response.data.error) {
        this.logger.error('Firebase error', response.data.error);
        throw new Error('Firebase error: ' + response.data.error);
      }
      return Object.values(response.data || {});
    } catch (error) {
      this.logger.error('Failed to get data by seqNo', error);
      throw error;
    }
  }

  async deleteById(firebaseUrl: string,table: string, id: string,accessToken?: string): Promise<{ status: string }> {
    let path = `/${table}/${id}.json`;
    if (accessToken) {
      path += `?auth=${accessToken}`;
    }
    try {
      console.log(firebaseUrl + path)
      await lastValueFrom(this.httpService.delete(firebaseUrl + path, {
        headers: {
          'Content-Type': 'application/json'
        }
      }));
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Failed to delete data by id', error);
      throw error;
    }
  }
  async deleteByIds(firebaseUrl: string, table: string, ids: string[],accessToken?: string): Promise<{ status: string }> {
    let path = firebaseUrl + '/.json';
      if (accessToken) {
        path += `?auth=${accessToken}`;
      }
      const updates = ids.reduce((acc, id) => {
        acc[`${table}/${id}`] = null;
        return acc;
      }, {});
      try {
        await lastValueFrom(this.httpService.patch(path, updates, {
          headers: {
            'Content-Type': 'application/json'
          }
        }));
        return { status: 'success' };
      } catch (error) {
        this.logger.error('Failed to delete data by ids', error);
        throw error;
      }
  }
  async updateById<T>(firebaseUrl: string,table: string, id: string, newData: T, accessToken?: string): Promise<{ status: string, data: T }> {
    if (!id) {
      return { status: 'error', data: null };
    }
    const path = `/${table}/${id}.json${accessToken ? `?auth=${accessToken}` : ''}`;
    try {
      const response = await lastValueFrom(this.httpService.patch(firebaseUrl + path, {
        ...newData, seqNo: new Date().getTime()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      }));
      return { status: 'success', data: response.data };
    } catch (error) {
      this.logger.error('Failed to update data by id', error);
      throw error;
    }
  }

  async getById<T>(firebaseUrl: string,table: string, id: string): Promise<{ data: T | null, msg: string }> {
    const path = `/${table}/${id}.json`;
    try {
      const response = await lastValueFrom(this.httpService.get(firebaseUrl + path, {
        headers: {
          'Content-Type': 'application/json'
        }
      }));
      if (!response.data) {
        return { data: null, msg: 'Not found' };
      }
      return { data: response.data, msg: 'success' };
    } catch (error) {
      this.logger.error('Failed to get data by id', error);
      throw error;
    }
  }
}