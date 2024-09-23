import { sha256 } from 'js-sha256';
import {vet} from "./Y3NyZlRva2Vu";
import { v4 as uuidv4 } from 'uuid';
export const apiCacheUrl = () =>
  'aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy8ke2FwcElkfS9leGVj';
export const getSalt = () => vet(sha256);
export const convertDate = (date: Date | string): Date => {
  if (date) {
    return new Date(date);
  }
  return null;
};
export const uuid = (): string => uuidv4();
