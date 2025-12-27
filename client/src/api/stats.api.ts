import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { ApiResponse } from '@/types/api.types';
import type {
  TopUploaderResponse,
  TopResourceResponse,
} from '@/types/stats.types';
import type { Resource } from '@/types/resource.types';

export const statsApi = {
  /**
   * Lấy danh sách top uploaders
   * @param limit Số lượng kết quả (mặc định: 5)
   */
  getTopUploaders: async (limit = 5): Promise<TopUploaderResponse[]> => {
    const response = await apiClient.get<ApiResponse<TopUploaderResponse[]>>(
      API_ENDPOINTS.STATS.TOP_UPLOADERS,
      {
        params: { limit },
      }
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách top resources
   * @param sort Loại sắp xếp: 'views' | 'downloads' | 'combined' (mặc định: 'views')
   * @param limit Số lượng kết quả (mặc định: 5)
   */
  getTopResources: async (
    sort: 'views' | 'downloads' | 'combined' = 'views',
    limit = 5
  ): Promise<TopResourceResponse[]> => {
    const response = await apiClient.get<ApiResponse<TopResourceResponse[]>>(
      API_ENDPOINTS.STATS.TOP_RESOURCES,
      {
        params: { sort, limit },
      }
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách uploads gần đây
   * @param limit Số lượng kết quả (mặc định: 10)
   */
  getRecentUploads: async (limit = 10): Promise<Resource[]> => {
    const response = await apiClient.get<ApiResponse<Resource[]>>(
      API_ENDPOINTS.STATS.RECENT_UPLOADS,
      {
        params: { limit },
      }
    );
    return response.data.data;
  },

  /**
   * Lấy tổng dung lượng lưu trữ đã sử dụng (chỉ ADMIN)
   */
  getStorageUsage: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<number>>(
      API_ENDPOINTS.STATS.STORAGE_USAGE
    );
    return response.data.data;
  },
};

