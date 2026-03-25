import { PRData } from '../types';

export interface IFetcher {
  fetch(): Promise<PRData>;
}
