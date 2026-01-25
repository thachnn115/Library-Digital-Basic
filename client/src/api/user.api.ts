import type {
	User,
	CreateUserRequest,
	UpdateUserRequest,
	UserFilterParams,
} from "@/types/user.types";
import type { ChangePasswordRequest } from "@/types/auth.types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import apiClient from "./client";

/**
 * User Management API Service
 */
export const userApi = {
	/**
	 * Get all users with filters and pagination
	 * Backend returns List<PublicUser>, not PaginatedResponse
	 */
	getAll: async (
		params?: UserFilterParams
	): Promise<PaginatedResponse<User>> => {
		const response = await apiClient.get<ApiResponse<User[]>>(
			API_ENDPOINTS.USER.BASE,
			{ params }
		);
		// Backend returns array directly, convert to PaginatedResponse format
		const users = response.data.data || [];
		return {
			content: users,
			totalElements: users.length,
			totalPages: 1,
			size: params?.size || users.length,
			number: params?.page || 0,
			first: true,
			last: true,
			empty: users.length === 0,
		};
	},

	/**
	 * Get user by ID
	 */
	getById: async (id: string | number): Promise<User> => {
		const response = await apiClient.get<ApiResponse<User>>(
			API_ENDPOINTS.USER.BY_ID(id)
		);
		return response.data.data;
	},

	/**
	 * Create new user
	 */
	create: async (data: CreateUserRequest): Promise<User> => {
		// Normalize email to lowercase
		// Remove empty strings and convert to null for optional fields
		const normalizedData: CreateUserRequest = {
			...data,
			email: data.email.trim().toLowerCase(),
			phone: data.phone?.trim() || undefined,
			address: data.address?.trim() || undefined,
			userIdentifier: data.userIdentifier?.trim() || undefined,
			dateOfBirth: data.dateOfBirth?.trim() || undefined,
			fullName: data.fullName?.trim() || undefined,
			classroomId: data.classroomId?.trim() || undefined,
		};

		const response = await apiClient.post<ApiResponse<User>>(
			API_ENDPOINTS.USER.CREATE,
			normalizedData
		);
		return response.data.data;
	},

	/**
	 * Update user
	 */
	update: async (
		id: string | number,
		data: UpdateUserRequest
	): Promise<User> => {
		const response = await apiClient.put<ApiResponse<User>>(
			API_ENDPOINTS.USER.UPDATE(id),
			data
		);
		return response.data.data;
	},

	/**
	 * Delete user
	 */
	delete: async (id: string | number): Promise<void> => {
		await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.USER.DELETE(id));
	},

	/**
	 * Reset user password
	 */
	resetPassword: async (
		id: string | number,
		newPassword: string
	): Promise<void> => {
		await apiClient.post<ApiResponse<void>>(
			API_ENDPOINTS.USER.RESET_PASSWORD(id),
			{ newPassword }
		);
	},

	/**
	 * Change own password
	 * Maps frontend oldPassword to backend currentPassword
	 */
	changePassword: async (data: ChangePasswordRequest): Promise<void> => {
		await apiClient.post<ApiResponse<void>>(
			API_ENDPOINTS.USER.CHANGE_PASSWORD,
			{
				currentPassword: data.oldPassword,
				newPassword: data.newPassword,
			}
		);
	},

	/**
	 * Import users from Excel (ADMIN only)
	 */
	importUsers: async (file: File): Promise<number> => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await apiClient.post<ApiResponse<number>>(
			API_ENDPOINTS.USER.IMPORT,
			formData
		);
		return response.data.data;
	},

	/**
	 * Download import template (ADMIN only)
	 */
	downloadImportTemplate: async (): Promise<{ blob: Blob; filename: string }> => {
		const response = await apiClient.get(
			API_ENDPOINTS.USER.IMPORT_TEMPLATE,
			{ responseType: "blob" }
		);
		const disposition =
			(response.headers &&
				(response.headers["content-disposition"] ||
					response.headers["Content-Disposition"])) ||
			"";
		let filename = "user-import-template.xlsx";
		const match = /filename=\"?([^\";]+)\"?/i.exec(disposition);
		if (match && match[1]) {
			filename = match[1];
		}
		return { blob: response.data as Blob, filename };
	},

	/**
	 * Update user avatar
	 */
	updateAvatar: async (id: string | number, file: File): Promise<User> => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await apiClient.put<ApiResponse<User>>(
			API_ENDPOINTS.USER.UPDATE_AVATAR(id),
			formData
		);

		return response.data.data;
	},
};
