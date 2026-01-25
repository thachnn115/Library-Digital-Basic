import type {
	Specialization,
	CreateSpecializationRequest,
} from '@/types/department.types';
import type { ApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import apiClient from './client';

const normalizeSpecialization = (spec: Specialization): Specialization => {
	const programs = spec.programs ?? [];
	const primaryProgram = spec.program || spec.trainingProgram || programs[0];
	return {
		...spec,
		programs,
		program: primaryProgram,
		trainingProgram: spec.trainingProgram || primaryProgram,
	};
};

/**
 * Specialization API Service
 */
export const specializationApi = {
	/**
	 * Get all specializations
	 * @param programId - Filter by program ID (optional)
	 * @param programCode - Filter by program code (optional)
	 * @param code - Filter by code (optional)
	 * @param name - Filter by name (optional)
	 */
	getAll: async (params?: {
		programId?: string;
		programCode?: string;
		code?: string;
		name?: string;
	}): Promise<Specialization[]> => {
		const response = await apiClient.get<ApiResponse<Specialization[]>>(
			API_ENDPOINTS.SPECIALIZATION.BASE,
			{ params }
		);
		return response.data.data.map(normalizeSpecialization);
	},

	/**
	 * Get specialization by ID
	 */
	getById: async (id: string | number): Promise<Specialization> => {
		const response = await apiClient.get<ApiResponse<Specialization>>(
			API_ENDPOINTS.SPECIALIZATION.BY_ID(id)
		);
		return normalizeSpecialization(response.data.data);
	},

	/**
	 * Create new specialization
	 */
	create: async (data: CreateSpecializationRequest): Promise<Specialization> => {
		const payload = {
			...data,
			programCodes: data.programCodes || [],
		};
		const response = await apiClient.post<ApiResponse<Specialization>>(
			API_ENDPOINTS.SPECIALIZATION.CREATE,
			payload
		);
		return normalizeSpecialization(response.data.data);
	},

	/**
	 * Update specialization
	 */
	update: async (
		id: string | number,
		data: CreateSpecializationRequest
	): Promise<Specialization> => {
		const payload = {
			...data,
			programCodes: data.programCodes || [],
		};
		const response = await apiClient.put<ApiResponse<Specialization>>(
			API_ENDPOINTS.SPECIALIZATION.UPDATE(id),
			payload
		);
		return normalizeSpecialization(response.data.data);
	},

	/**
	 * Delete specialization
	 */
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete<ApiResponse<void>>(
			API_ENDPOINTS.SPECIALIZATION.DELETE(id)
		);
	},
};

