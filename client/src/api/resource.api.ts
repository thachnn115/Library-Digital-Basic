import type {
	Resource,
	ResourceSearchParams,
	ResourceUploadRequest,
	ResourceBrowseParams,
	ResourceFolderResponse,
} from '@/types/resource.types';
import type { ApiResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import apiClient from './client';

/**
 * Resource API Service
 */
export const resourceApi = {
	/**
	 * Upload resource file
	 */
	upload: async (
		file: File,
		data: Omit<ResourceUploadRequest, 'file'>
	): Promise<Resource> => {
		const formData = new FormData();
		formData.append('file', file);
		formData.append(
			'data',
			new Blob([JSON.stringify(data)], { type: 'application/json' })
		);

		const response = await apiClient.post<ApiResponse<Resource>>(
			API_ENDPOINTS.RESOURCE.UPLOAD,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data.data;
	},

	/**
	 * Search resources with filters (LECTURER only)
	 */
	search: async (params: ResourceSearchParams): Promise<Resource[]> => {
		const queryParams: Record<string, string | string[]> = {};

		if (params.courseKeyword) {
			queryParams.courseKeyword = params.courseKeyword;
		}
		if (params.programCode && params.programCode.length > 0) {
			queryParams.programCode = params.programCode;
		}
		if (params.specializationCode && params.specializationCode.length > 0) {
			queryParams.specializationCode = params.specializationCode;
		}
		if (params.cohortCode && params.cohortCode.length > 0) {
			queryParams.cohortCode = params.cohortCode;
		}
		if (params.classroomId && params.classroomId.length > 0) {
			queryParams.classroomId = params.classroomId;
		}
		if (params.lecturerId && params.lecturerId.length > 0) {
			queryParams.lecturerId = params.lecturerId;
		}
		if (params.typeId && params.typeId.length > 0) {
			queryParams.typeId = params.typeId;
		}

		const response = await apiClient.get<ApiResponse<Resource[]>>(
			API_ENDPOINTS.RESOURCE.SEARCH,
			{ params: queryParams }
		);
		return response.data.data;
	},

	/**
	 * Browse resources by folder hierarchy (LECTURER only)
	 */
	browse: async (params: ResourceBrowseParams): Promise<ResourceFolderResponse> => {
		const queryParams: Record<string, string> = {};

		if (params.programCode) {
			queryParams.programCode = params.programCode;
		}
		if (params.specializationCode) {
			queryParams.specializationCode = params.specializationCode;
		}
		if (params.courseTitle) {
			queryParams.courseTitle = params.courseTitle;
		}
		if (params.lecturerId) {
			queryParams.lecturerId = params.lecturerId;
		}
		if (params.classroomId) {
			queryParams.classroomId = params.classroomId;
		}

		const response = await apiClient.get<ApiResponse<ResourceFolderResponse>>(
			API_ENDPOINTS.RESOURCE.BROWSE,
			{ params: queryParams }
		);
		return response.data.data;
	},

	/**
	 * Get resource by ID
	 */
	getById: async (id: string | number): Promise<Resource> => {
		const response = await apiClient.get<ApiResponse<Resource>>(
			API_ENDPOINTS.RESOURCE.BY_ID(id)
		);
		return response.data.data;
	},

	/**
	 * View resource file (increments view count)
	 * Returns the Blob directly from the response - don't convert to avoid ArrayBuffer detachment
	 */
	view: async (id: string | number): Promise<Blob> => {
		const response = await apiClient.get<Blob>(API_ENDPOINTS.RESOURCE.VIEW(id), {
			responseType: 'blob',
		});
		
		// Return Blob directly - don't convert to avoid ArrayBuffer detachment issues
		// The blob URL will be created in ResourceViewer, which is safer for react-pdf
		if (response.data instanceof Blob) {
			return response.data;
		}
		
		// Fallback: if not a Blob, convert it
		const contentType = response.headers['content-type'] || 'application/octet-stream';
		return new Blob([response.data], { type: contentType });
	},

	/**
	 * Download resource file (increments download count)
	 */
	download: async (id: string | number): Promise<Blob> => {
		const response = await apiClient.get<Blob>(API_ENDPOINTS.RESOURCE.DOWNLOAD(id), {
			responseType: 'blob',
		});
		return response.data;
	},

	/**
	 * Get all resources (role-based visibility)
	 * @param typeId - Filter by resource type ID (optional)
	 * @param keyword - Search keyword (optional)
	 */
	getAll: async (params?: {
		typeId?: string;
		keyword?: string;
	}): Promise<Resource[]> => {
		const response = await apiClient.get<ApiResponse<Resource[]>>(
			API_ENDPOINTS.RESOURCE.BASE,
			{ params }
		);
		return response.data.data;
	},

	/**
	 * Get my uploaded resources
	 */
	getMyUploads: async (): Promise<Resource[]> => {
		const response = await apiClient.get<ApiResponse<Resource[]>>(
			API_ENDPOINTS.RESOURCE.MY_UPLOADS
		);
		return response.data.data;
	},

	/**
	 * Delete resource
	 */
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.RESOURCE.DELETE(id));
	},

	/**
	 * Update resource approval status (ADMIN/SUB_ADMIN only)
	 */
	updateApprovalStatus: async (
		id: string | number,
		status: 'PENDING' | 'APPROVED' | 'REJECTED'
	): Promise<Resource> => {
		const response = await apiClient.put<ApiResponse<Resource>>(
			API_ENDPOINTS.RESOURCE.UPDATE_APPROVAL(id),
			{ status }
		);
		return response.data.data;
	},
};

