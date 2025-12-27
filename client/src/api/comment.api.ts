import type { Comment, CreateCommentRequest, UpdateCommentRequest } from '@/types/comment.types';
import type { ApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import apiClient from './client';

/**
 * Comment API Service
 */
export const commentApi = {
	/**
	 * Get comments by resource ID
	 */
	getByResource: async (resourceId: string | number): Promise<Comment[]> => {
		const response = await apiClient.get<ApiResponse<Comment[]>>(
			API_ENDPOINTS.COMMENT.BY_RESOURCE(resourceId)
		);
		return response.data.data;
	},

	/**
	 * Create comment
	 */
	create: async (data: CreateCommentRequest): Promise<Comment> => {
		const response = await apiClient.post<ApiResponse<Comment>>(
			API_ENDPOINTS.COMMENT.CREATE,
			data
		);
		return response.data.data;
	},

	/**
	 * Update comment
	 */
	update: async (id: string | number, data: UpdateCommentRequest): Promise<Comment> => {
		const response = await apiClient.put<ApiResponse<Comment>>(
			API_ENDPOINTS.COMMENT.UPDATE(id),
			data
		);
		return response.data.data;
	},

	/**
	 * Delete comment
	 */
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.COMMENT.DELETE(id));
	},
};

