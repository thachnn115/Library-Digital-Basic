import type {
	ResourceType,
	CreateResourceTypeRequest,
} from '@/types/department.types';
import type { ApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import apiClient from './client';

/**
 * Resource Type API Service
 */
export const resourceTypeApi = {
	/**
	 * Get all resource types
	 */
	getAll: async (): Promise<ResourceType[]> => {
		const response = await apiClient.get<ApiResponse<ResourceType[]>>(
			API_ENDPOINTS.RESOURCE_TYPE.BASE
		);
		return response.data.data;
	},

	/**
	 * Get resource type by ID
	 */
	getById: async (id: string | number): Promise<ResourceType> => {
		const response = await apiClient.get<ApiResponse<ResourceType>>(
			API_ENDPOINTS.RESOURCE_TYPE.BY_ID(id)
		);
		return response.data.data;
	},

	/**
	 * Create new resource type
	 */
	create: async (data: CreateResourceTypeRequest): Promise<ResourceType> => {
		const response = await apiClient.post<ApiResponse<ResourceType>>(
			API_ENDPOINTS.RESOURCE_TYPE.CREATE,
			data
		);
		return response.data.data;
	},

	/**
	 * Update resource type
	 */
	update: async (
		id: string | number,
		data: CreateResourceTypeRequest
	): Promise<ResourceType> => {
		const response = await apiClient.put<ApiResponse<ResourceType>>(
			API_ENDPOINTS.RESOURCE_TYPE.UPDATE(id),
			data
		);
		return response.data.data;
	},

	/**
	 * Delete resource type
	 */
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete<ApiResponse<void>>(
			API_ENDPOINTS.RESOURCE_TYPE.DELETE(id)
		);
	},
};

