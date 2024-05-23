export class EntityModel {
    id?: string; // Optional for new entities
    seqNo: number;
    deleted: boolean;
    sync: boolean;
  }
  export const convertDate = (date: Date | string): Date => {
    if (date) {
      return new Date(date);
    }
    return null;
  };