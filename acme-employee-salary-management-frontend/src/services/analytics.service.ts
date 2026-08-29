import { httpClient } from '@/client/client';
import type { SingleResponse, AnalyticsData, AnalyticsQueryParams } from '@/types/api.types';

export const analyticsService = {
  getAnalytics: (params: AnalyticsQueryParams = {}): Promise<SingleResponse<AnalyticsData>> => {
    const query = new URLSearchParams();
    if (params.countryId) query.append('countryId', String(params.countryId));
    if (params.departmentId) query.append('departmentId', String(params.departmentId));
    if (params.status) query.append('status', params.status);

    const queryString = query.toString();
    return httpClient<SingleResponse<AnalyticsData>>(`/analytics${queryString ? `?${queryString}` : ''}`);
  },
};
