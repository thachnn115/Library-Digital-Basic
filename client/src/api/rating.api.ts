import type { Rating, CreateRatingRequest, UpdateRatingRequest } from '@/types/rating.types';
import type { ApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import apiClient from './client';

/**
 * Rating API Service
 */
export const ratingApi = {
	/**
	 * Get ratings by resource ID
	 */
	getByResource: async (resourceId: string | number): Promise<Rating[]> => {
		const response = await apiClient.get<ApiResponse<Rating[]>>(
			API_ENDPOINTS.RATING.BY_RESOURCE(resourceId)
		);
		return response.data.data;
	},

	/**
	 * Create rating
	 */
	create: async (data: CreateRatingRequest): Promise<Rating> => {
		const response = await apiClient.post<ApiResponse<Rating>>(
			API_ENDPOINTS.RATING.CREATE,
			data
		);
		return response.data.data;
	},

	/**
	 * Update rating
	 */
	update: async (id: string | number, data: UpdateRatingRequest): Promise<Rating> => {
		const response = await apiClient.put<ApiResponse<Rating>>(
			API_ENDPOINTS.RATING.UPDATE(id),
			data
		);
		return response.data.data;
	},

	/**
	 * Delete rating
	 */
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.RATING.DELETE(id));
	},
};

