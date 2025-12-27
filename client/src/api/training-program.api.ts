import type {
	TrainingProgram,
	CreateTrainingProgramRequest,
} from '@/types/department.types';
import type { ApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import apiClient from './client';

/**
 * Training Program API Service
 */
export const trainingProgramApi = {
	/**
	 * Get all training programs
	 * @param code - Filter by code (optional)
	 * @param name - Filter by name (optional)
	 */
	getAll: async (params?: { code?: string; name?: string }): Promise<TrainingProgram[]> => {
		const response = await apiClient.get<ApiResponse<TrainingProgram[]>>(
			API_ENDPOINTS.TRAINING_PROGRAM.BASE,
			{ params }
		);
		return response.data.data;
	},

	/**
	 * Get training program by ID
	 */
	getById: async (id: string | number): Promise<TrainingProgram> => {
		const response = await apiClient.get<ApiResponse<TrainingProgram>>(
			API_ENDPOINTS.TRAINING_PROGRAM.BY_ID(id)
		);
		return response.data.data;
	},

	/**
	 * Create new training program
	 */
	create: async (
		data: CreateTrainingProgramRequest
	): Promise<TrainingProgram> => {
		const response = await apiClient.post<ApiResponse<TrainingProgram>>(
			API_ENDPOINTS.TRAINING_PROGRAM.CREATE,
			data
		);
		return response.data.data;
	},

	/**
	 * Update training program
	 */
	update: async (
		id: string | number,
		data: CreateTrainingProgramRequest
	): Promise<TrainingProgram> => {
		const response = await apiClient.put<ApiResponse<TrainingProgram>>(
			API_ENDPOINTS.TRAINING_PROGRAM.UPDATE(id),
			data
		);
		return response.data.data;
	},

	/**
	 * Delete training program
	 */
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete<ApiResponse<void>>(
			API_ENDPOINTS.TRAINING_PROGRAM.DELETE(id)
		);
	},
};

