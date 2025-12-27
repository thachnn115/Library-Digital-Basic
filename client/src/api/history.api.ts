import type { History } from '@/types/history.types';
import type { ApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import apiClient from './client';

/**
 * History API Service
 */
export const historyApi = {
	/**
	 * Get view history for current user
	 */
	getViews: async (): Promise<History[]> => {
		const response = await apiClient.get<ApiResponse<History[]>>(
			API_ENDPOINTS.HISTORY.VIEWS
		);
		return response.data.data;
	},

	/**
	 * Get download history for current user
	 */
	getDownloads: async (): Promise<History[]> => {
		const response = await apiClient.get<ApiResponse<History[]>>(
			API_ENDPOINTS.HISTORY.DOWNLOADS
		);
		return response.data.data;
	},
};

