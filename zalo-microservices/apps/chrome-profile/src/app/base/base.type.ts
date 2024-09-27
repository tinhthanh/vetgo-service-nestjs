
export interface ResponseBase<T> {
    successful: boolean;
    data: Data<T>;
  }
  export interface ResponseObjBase<T> {
    serverDateTime: string;
    status: number;
    code: number;
    msg: string;
    successful: boolean;
    data: T;
  }

  export interface Data<T> {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    elements: T[];
    hasPrevious: boolean;
    hasMore: boolean;
  }


  export interface EntityModel {
    id: string | null;
    seqNo?: number;
    deleted?: boolean;
    sync?: boolean;
  }
