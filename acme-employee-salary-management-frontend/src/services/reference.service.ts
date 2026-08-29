import { httpClient } from '@/client/client';
import type { SingleResponse, Department, Country, Currency } from '@/types/api.types';

export const referenceService = {
  getDepartments: (): Promise<SingleResponse<Department[]>> => {
    return httpClient<SingleResponse<Department[]>>('/departments');
  },

  getCountries: (): Promise<SingleResponse<Country[]>> => {
    return httpClient<SingleResponse<Country[]>>('/countries');
  },

  getCurrencies: (): Promise<SingleResponse<Currency[]>> => {
    return httpClient<SingleResponse<Currency[]>>('/currencies');
  },
};
