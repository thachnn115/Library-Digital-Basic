import axios, {
	AxiosError,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";

// Tạo axios instance với cấu hình base
const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor - Inject token vào header
apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = localStorage.getItem("access_token");

		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		// Don't set Content-Type for FormData - let browser set it with boundary
		if (config.data instanceof FormData && config.headers) {
			delete config.headers['Content-Type'];
		}

		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

// Response interceptor - Xử lý lỗi tập trung
apiClient.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	(error: AxiosError) => {
		// Xử lý lỗi 401 - Unauthorized (token hết hạn)
		if (error.response?.status === 401) {
			localStorage.removeItem("access_token");
			localStorage.removeItem("user_info");
			window.location.href = "/login";
		}

		// Xử lý lỗi 403 - Forbidden (không có quyền)
		if (error.response?.status === 403) {
			console.error("Bạn không có quyền truy cập tài nguyên này");
		}

		// Xử lý lỗi 400 - Bad Request (validation errors)
		if (error.response?.status === 400) {
			const errorData = error.response?.data as { message?: string; error?: string } | undefined;
			const errorMessage = errorData?.message || errorData?.error || "Dữ liệu không hợp lệ";
			console.error("Bad request error:", errorMessage);
		}

		// Xử lý lỗi 500 - Server error
		if (error.response?.status === 500) {
			const errorData = error.response?.data as { message?: string; error?: string } | undefined;
			const errorMessage = errorData?.message || errorData?.error || "Lỗi server, vui lòng thử lại sau";
			console.error("Server error:", errorMessage);
		}

		return Promise.reject(error);
	}
);

export default apiClient;
