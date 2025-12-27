// Rating Types
export interface Rating {
	id: number;
	rating: number; // 1-5
	resourceId: string;
	rater?: {
		id: string;
		email: string;
		fullName: string;
		avatarUrl?: string | null;
	};
	createdAt: string;
}

export interface CreateRatingRequest {
	resourceId: string;
	rating: number; // 1-5
}

export interface UpdateRatingRequest {
	rating: number; // 1-5
}

