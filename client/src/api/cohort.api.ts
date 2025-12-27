import type { Cohort, CreateCohortRequest } from '@/types/department.types';
import type { ApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import apiClient from './client';

/**
 * Cohort API Service
 */
export const cohortApi = {
	/**
	 * Get all cohorts
	 * @param code - Filter by code (optional)
	 * @param programCode - Filter by program code (optional)
	 * @param startYear - Filter by start year (optional)
	 * @param endYear - Filter by end year (optional)
	 */
	getAll: async (params?: {
		code?: string;
		programCode?: string;
		startYear?: number;
		endYear?: number;
	}): Promise<Cohort[]> => {
		const response = await apiClient.get<ApiResponse<Cohort[]>>(
			API_ENDPOINTS.COHORT.BASE,
			{ params }
		);
		return response.data.data;
	},

	/**
	 * Get cohort by ID
	 */
	getById: async (id: string | number): Promise<Cohort> => {
		const response = await apiClient.get<ApiResponse<Cohort>>(
			API_ENDPOINTS.COHORT.BY_ID(id)
		);
		return response.data.data;
	},

	/**
	 * Create new cohort
	 */
	create: async (data: CreateCohortRequest): Promise<Cohort> => {
		const response = await apiClient.post<ApiResponse<Cohort>>(
			API_ENDPOINTS.COHORT.CREATE,
			data
		);
		return response.data.data;
	},

	/**
	 * Update cohort
	 */
	update: async (
		id: string | number,
		data: CreateCohortRequest
	): Promise<Cohort> => {
		const response = await apiClient.put<ApiResponse<Cohort>>(
			API_ENDPOINTS.COHORT.UPDATE(id),
			data
		);
		return response.data.data;
	},

	/**
	 * Delete cohort
	 */
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.COHORT.DELETE(id));
	},
};

