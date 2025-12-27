// API Endpoints
export const API_ENDPOINTS = {
	// Authentication
	AUTH: {
		SIGN_IN: "/auth/sign-in",
		FORGOT_PASSWORD: "/auth/forgot-password",
		RESET_PASSWORD: "/auth/reset-password",
		VERIFY_OTP: "/auth/verify-otp",
		RESEND_OTP: "/auth/resend-otp",
		REFRESH_TOKEN: "/auth/refresh-token",
		SIGN_OUT: "/auth/sign-out",
	},

	// User Management
	USER: {
		BASE: "/users",
		BY_ID: (id: string | number) => `/users/${id}`,
		CREATE: "/users",
		UPDATE: (id: string | number) => `/users/${id}`,
		DELETE: (id: string | number) => `/users/${id}`,
		RESET_PASSWORD: (id: string | number) => `/users/${id}/reset-password`,
		CHANGE_PASSWORD: "/users/change-password",
		IMPORT: "/users/import",
		UPDATE_AVATAR: (id: string | number) => `/users/${id}/avatar`,
	},

	// Resource Management
	RESOURCE: {
		BASE: "/resource",
		UPLOAD: "/resource/upload",
		SEARCH: "/resource/search",
		BROWSE: "/resource/browse",
		BY_ID: (id: string | number) => `/resource/${id}`,
		VIEW: (id: string | number) => `/resource/${id}/view`,
		DOWNLOAD: (id: string | number) => `/resource/${id}/download`,
		MY_UPLOADS: "/resource/my-uploads",
		DELETE: (id: string | number) => `/resource/${id}`,
		UPDATE_APPROVAL: (id: string | number) => `/resource/${id}/approval-status`,
	},

	// Department
	DEPARTMENT: {
		BASE: "/department",
		BY_ID: (id: string | number) => `/department/${id}`,
		CREATE: "/department",
		UPDATE: (id: string | number) => `/department/${id}`,
		DELETE: (id: string | number) => `/department/${id}`,
	},

	// Training Program
	TRAINING_PROGRAM: {
		BASE: "/program",
		BY_ID: (id: string | number) => `/program/${id}`,
		CREATE: "/program",
		UPDATE: (id: string | number) => `/program/${id}`,
		DELETE: (id: string | number) => `/program/${id}`,
	},

	// Specialization
	SPECIALIZATION: {
		BASE: "/specialization",
		BY_ID: (id: string | number) => `/specialization/${id}`,
		CREATE: "/specialization",
		UPDATE: (id: string | number) => `/specialization/${id}`,
		DELETE: (id: string | number) => `/specialization/${id}`,
	},

	// Cohort
	COHORT: {
		BASE: "/cohort",
		BY_ID: (id: string | number) => `/cohort/${id}`,
		CREATE: "/cohort",
		UPDATE: (id: string | number) => `/cohort/${id}`,
		DELETE: (id: string | number) => `/cohort/${id}`,
	},

	// Classroom
	CLASSROOM: {
		BASE: "/classroom",
		BY_ID: (id: string | number) => `/classroom/${id}`,
		CREATE: "/classroom",
		UPDATE: (id: string | number) => `/classroom/${id}`,
		DELETE: (id: string | number) => `/classroom/${id}`,
	},

	// Course
	COURSE: {
		BASE: "/course",
		BY_ID: (id: string | number) => `/course/${id}`,
		CREATE: "/course",
		UPDATE: (id: string | number) => `/course/${id}`,
		DELETE: (id: string | number) => `/course/${id}`,
	},

	// Resource Type
	RESOURCE_TYPE: {
		BASE: "/resource-type",
		BY_ID: (id: string | number) => `/resource-type/${id}`,
		CREATE: "/resource-type",
		UPDATE: (id: string | number) => `/resource-type/${id}`,
		DELETE: (id: string | number) => `/resource-type/${id}`,
	},

	// Statistics
	STATS: {
		TOP_UPLOADERS: "/stats/top-uploaders",
		TOP_RESOURCES: "/stats/top-resources",
		RECENT_UPLOADS: "/stats/recent-uploads",
		STORAGE_USAGE: "/stats/storage-usage",
	},

	// History
	HISTORY: {
		BASE: "/history",
		VIEWS: "/history/views",
		DOWNLOADS: "/history/downloads",
		BY_USER: (userId: string | number) => `/history?userId=${userId}`,
		BY_ACTION: (action: string) => `/history?action=${action}`,
	},

	// Comment
	COMMENT: {
		BASE: "/comment",
		BY_RESOURCE: (resourceId: string | number) =>
			`/comment?resourceId=${resourceId}`,
		BY_ID: (id: string | number) => `/comment/${id}`,
		CREATE: "/comment",
		UPDATE: (id: string | number) => `/comment/${id}`,
		DELETE: (id: string | number) => `/comment/${id}`,
	},

	// Rating
	RATING: {
		BASE: "/rating",
		BY_RESOURCE: (resourceId: string | number) =>
			`/rating?resourceId=${resourceId}`,
		BY_ID: (id: string | number) => `/rating/${id}`,
		CREATE: "/rating",
		UPDATE: (id: string | number) => `/rating/${id}`,
		DELETE: (id: string | number) => `/rating/${id}`,
	},

	// AI
	AI: {
		CHAT: "/ai/chat",
	},
} as const;
