import type {
	Classroom,
	CreateClassroomRequest,
} from '@/types/department.types';
import type { ApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import apiClient from './client';

/**
 * Classroom API Service
 */
export const classroomApi = {
	/**
	 * Get all classrooms
	 * @param code - Filter by code (optional)
	 * @param specializationCode - Filter by specialization code (optional)
	 * @param cohortCode - Filter by cohort code (optional)
	 */
	getAll: async (params?: {
		code?: string;
		specializationCode?: string;
		cohortCode?: string;
	}): Promise<Classroom[]> => {
		const response = await apiClient.get<ApiResponse<Classroom[]>>(
			API_ENDPOINTS.CLASSROOM.BASE,
			{ params }
		);
		return response.data.data;
	},

	/**
	 * Get classroom by ID
	 */
	getById: async (id: string | number): Promise<Classroom> => {
		const response = await apiClient.get<ApiResponse<Classroom>>(
			API_ENDPOINTS.CLASSROOM.BY_ID(id)
		);
		return response.data.data;
	},

	/**
	 * Create new classroom
	 */
	create: async (data: CreateClassroomRequest): Promise<Classroom> => {
		const response = await apiClient.post<ApiResponse<Classroom>>(
			API_ENDPOINTS.CLASSROOM.CREATE,
			data
		);
		return response.data.data;
	},

	/**
	 * Update classroom
	 */
	update: async (
		id: string | number,
		data: CreateClassroomRequest
	): Promise<Classroom> => {
		const response = await apiClient.put<ApiResponse<Classroom>>(
			API_ENDPOINTS.CLASSROOM.UPDATE(id),
			data
		);
		return response.data.data;
	},

	/**
	 * Delete classroom
	 */
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete<ApiResponse<void>>(
			API_ENDPOINTS.CLASSROOM.DELETE(id)
		);
	},
};

