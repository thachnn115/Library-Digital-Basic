// API Response Types
export interface ApiResponse<T> {
	data: T;
	message?: string;
	status: number;
}

export interface ApiError {
	message: string;
	status: number;
	errors?: Record<string, string[]>;
}

export interface PaginationParams {
	page?: number;
	size?: number;
	sort?: string;
	order?: "ASC" | "DESC";
}

export interface PaginatedResponse<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	size: number;
	number: number;
	first: boolean;
	last: boolean;
	empty: boolean;
}

export interface SortParams {
	field: string;
	order: "ASC" | "DESC";
}

export interface FilterParams {
	[key: string]: string | number | boolean | undefined | null;
}
