import type {
	Department,
	CreateDepartmentRequest,
} from '@/types/department.types';
import type { ApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import apiClient from './client';

/**
 * Department API Service
 */
export const departmentApi = {
	/**
	 * Get all departments
	 */
	getAll: async (): Promise<Department[]> => {
		const response = await apiClient.get<ApiResponse<Department[]>>(
			API_ENDPOINTS.DEPARTMENT.BASE
		);
		return response.data.data;
	},

	/**
	 * Get department by ID
	 */
	getById: async (id: string | number): Promise<Department> => {
		const response = await apiClient.get<ApiResponse<Department>>(
			API_ENDPOINTS.DEPARTMENT.BY_ID(id)
		);
		return response.data.data;
	},

	/**
	 * Create new department
	 */
	create: async (data: CreateDepartmentRequest): Promise<Department> => {
		const response = await apiClient.post<ApiResponse<Department>>(
			API_ENDPOINTS.DEPARTMENT.CREATE,
			data
		);
		return response.data.data;
	},

	/**
	 * Update department
	 */
	update: async (
		id: string | number,
		data: CreateDepartmentRequest
	): Promise<Department> => {
		const response = await apiClient.put<ApiResponse<Department>>(
			API_ENDPOINTS.DEPARTMENT.UPDATE(id),
			data
		);
		return response.data.data;
	},

	/**
	 * Delete department
	 */
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.DEPARTMENT.DELETE(id));
	},
};

