import type {
	LoginRequest,
	LoginResponse,
	ForgotPasswordRequest,
	ResetPasswordRequest,
	VerifyOtpRequest,
} from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import apiClient from "./client";

/**
 * Authentication API Service
 */
export const authApi = {
	/**
	 * Sign in user
	 */
	signIn: async (data: LoginRequest): Promise<LoginResponse> => {
		// Normalize email to lowercase
		const normalizedData = {
			...data,
			email: data.email.trim().toLowerCase(),
		};
		
		const response = await apiClient.post<ApiResponse<LoginResponse>>(
			API_ENDPOINTS.AUTH.SIGN_IN,
			normalizedData
		);
		return response.data.data;
	},

	/**
	 * Request password reset (send email)
	 */
	forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
		await apiClient.post<ApiResponse<void>>(
			API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
			data
		);
	},

	/**
	 * Reset password with token
	 */
	resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
		await apiClient.post<ApiResponse<void>>(
			API_ENDPOINTS.AUTH.RESET_PASSWORD,
			data
		);
	},

	/**
	 * Verify OTP (Multi-Factor Authentication)
	 */
	verifyOtp: async (data: VerifyOtpRequest): Promise<LoginResponse> => {
		const response = await apiClient.post<ApiResponse<LoginResponse>>(
			API_ENDPOINTS.AUTH.VERIFY_OTP,
			data
		);
		return response.data.data;
	},

	/**
	 * Resend OTP
	 */
	resendOtp: async (email: string): Promise<void> => {
		await apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.RESEND_OTP, {
			email,
		});
	},

	/**
	 * Sign out user
	 */
	signOut: async (): Promise<void> => {
		await apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.SIGN_OUT);
	},

	/**
	 * Refresh access token
	 */
	refreshToken: async (): Promise<LoginResponse> => {
		const response = await apiClient.post<ApiResponse<LoginResponse>>(
			API_ENDPOINTS.AUTH.REFRESH_TOKEN
		);
		return response.data.data;
	},
};
