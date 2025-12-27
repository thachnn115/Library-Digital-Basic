import type { Course, CreateCourseRequest } from '@/types/department.types';
import type { ApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import apiClient from './client';

/**
 * Course API Service
 */
export const courseApi = {
	/**
	 * Get all courses
	 * @param cohortCode - Filter by cohort code (optional)
	 * @param specializationCode - Filter by specialization code (optional)
	 * @param title - Filter by title (optional)
	 * @param departmentCode - Filter by department code (optional)
	 */
	getAll: async (params?: {
		cohortCode?: string;
		specializationCode?: string;
		title?: string;
		departmentCode?: string;
	}): Promise<Course[]> => {
		const response = await apiClient.get<ApiResponse<Course[]>>(
			API_ENDPOINTS.COURSE.BASE,
			{ params }
		);
		return response.data.data;
	},

	/**
	 * Get course by ID
	 */
	getById: async (id: string | number): Promise<Course> => {
		const response = await apiClient.get<ApiResponse<Course>>(
			API_ENDPOINTS.COURSE.BY_ID(id)
		);
		return response.data.data;
	},

	/**
	 * Create new course
	 */
	create: async (data: CreateCourseRequest): Promise<Course> => {
		const response = await apiClient.post<ApiResponse<Course>>(
			API_ENDPOINTS.COURSE.CREATE,
			data
		);
		return response.data.data;
	},

	/**
	 * Update course
	 */
	update: async (
		id: string | number,
		data: CreateCourseRequest
	): Promise<Course> => {
		const response = await apiClient.put<ApiResponse<Course>>(
			API_ENDPOINTS.COURSE.UPDATE(id),
			data
		);
		return response.data.data;
	},

	/**
	 * Delete course
	 */
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.COURSE.DELETE(id));
	},
};

