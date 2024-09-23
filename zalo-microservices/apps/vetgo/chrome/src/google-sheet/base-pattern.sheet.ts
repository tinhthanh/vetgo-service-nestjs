import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {EntityModel} from "../models";
import {apiCacheUrl, getSalt} from "../utils/db-utils";
export const urlSheet  = atob(apiCacheUrl()).replace('${appId}', atob('QUtmeWNieXpOeFUwODZ2dEN4cFdXdzc1alZHR0lEa2hmbmktVFNydTVqT1JlM2FfaDRHNnJQSlJ5V1NHczNKZXVMRHhYX1Az'));
interface CacheResponse<T> {
  status: 'SUCCESS' | 'FAILED';
  msg: string;
  data: T;
}
export abstract class BasePatternSheet<T extends EntityModel> {
  headers = {'Content-Type' : 'text/plain; charset=utf-8'};
  protected constructor(
    protected table: string
  ) {
    // not call any method here
  }
  // public
  public appScript(): {
    add: (data: T) => Observable<T>;
    addAll: (data: T[]) => Observable<T[]>;
    update: (data: T, id: string) => Observable<T>;
    getByID: (id: string) => Observable<T>;
    getAll: () => Observable<T[]>;
    uploadImg: (
      base64: string,
      name: string,
      type: string
    ) => Observable<string>;
    clearData: () => Observable<CacheResponse<T>>;
    deleteById: (id: string) => Observable<CacheResponse<T>>;
    getBySeq: (seqNo: number) => Observable<T[]>;
    pagination: (page: number, pageSize) => Observable<T[]>;
  } {
    return {
      add: (data: T): Observable<T> => {
        return this.addV(this.stringify(data));
      },
      addAll: (data: T[]): Observable<T[]> => {
        return this.addAllV(data.map((it) => this.stringify(it)));
      },
      update: (data: T, id: string): Observable<T> => {
        return this.updateV(this.stringify(data), id);
      },
      getAll: (): Observable<T[]> => {
        return this.getAllV().pipe(map((it) => it.map((i) => this.toData(i))));
      },
      getByID: (id: string): Observable<T> => {
        return this.getByIDV(id).pipe(map((it) => this.toData(it)));
      },
      uploadImg: (
        base64: string,
        name: string,
        type: string
      ): Observable<string> => {
        return this.uploadImgV(base64, name, type);
      },
      clearData: (): Observable<CacheResponse<T>> => {
        return this.clearDataV();
      },
      deleteById: (id: string): Observable<CacheResponse<T>> => {
        return this.deleteByIdV(id);
      },
      getBySeq: (seqNo: number): Observable<T[]> =>
        this.getBySeq(seqNo).pipe(map((it) => it.map((i) => this.toData(i)))),
      pagination: (page: number, pageSize): Observable<T[]> =>
        this.pagination(page, pageSize).pipe(
          map((it) => it.map((i) => this.toData(i)))
        ),
    };
  }
  // private
  // must id : null
  private addV(data: T): Observable<T> {
    const obj = {
      actionType: 'POST',
      table: this.table,
      data,
      ...getSalt(),
    };
    return this
      .post(urlSheet, obj)
      .pipe(map((it) => it.data));
  }
  post(url: string , data: any): Observable<any> {
   return new Observable(observer => {
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: this.headers
      })
        .then(response => response.json())
        .then(responseData => {
          observer.next(responseData);
          observer.complete();
        })
        .catch(error => observer.error(error));
    })
  }
  // add list data , if id exits on database will update
  private addAllV(data: T[]): Observable<T[]> {
    const obj = {
      actionType: 'addAll',
      table: this.table,
      data,
      ...getSalt(),
    };
    return this.post(urlSheet, obj);
  }
  private updateV(data: T, id: string): Observable<T> {
    console.log(id); // keep id
    const obj = {
      actionType: 'POST',
      table: this.table,
      ...getSalt(),
      data,
    };
    return this.post(urlSheet, obj)
      .pipe(map((it) => it.data));
  }
  private getByIDV(id: string): Observable<T> {
    const obj = {
      actionType: 'getById',
      table: this.table,
      id,
      ...getSalt(),
    };
    return this.post(urlSheet, obj)
      .pipe(map((it) => it.data));
  }
  // if not internet return base64
  private uploadImgV(
    base64: string,
    name: string,
    type: string
  ): Observable<string> {
    const obj = {
      actionType: 'UPLOAD',
      base64,
      type,
      name,
      ...getSalt(),
    };
    return this.post(urlSheet, obj)
      .pipe(
        switchMap(it => {
          return of(it.data as any);
        })
      );
  }
  // will remove table
  private clearDataV(): Observable<CacheResponse<T>> {
    const obj = {
      actionType: 'CLEAR',
      table: this.table,
      ...getSalt(),
    };
    return this.post(urlSheet, obj);
  }
  private deleteByIdV(id: string): Observable<CacheResponse<T>> {
    const obj = {
      actionType: 'DELETE',
      table: this.table,
      id,
      ...getSalt(),
    };
    return this.post(urlSheet, obj);
  }
  private getBySeq(seqNo: number): Observable<T[]> {
    const obj = {
      actionType: 'SEQUENCE',
      table: this.table,
      ...getSalt(),
      seqNo,
    };
    return this.post(urlSheet, obj);
  }
  private pagination(page: number = 1, pageSize: number = 10): Observable<T[]> {
    const obj = {
      actionType: 'GET',
      table: this.table,
      ...getSalt(),
      pagination: {
        page,
        pageSize,
      },
    };
    return this.post(urlSheet, obj);
  }
  private getAllV(): Observable<T[]> {
    const obj = {
      actionType: 'GET',
      table: this.table,
      ...getSalt(),
    };
    return this.post(urlSheet, obj);
  }
  // override by child convert type data
  public abstract toData(data: T): T;
  public abstract stringify(data: T): T;
}
