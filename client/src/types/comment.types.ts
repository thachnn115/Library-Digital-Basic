// Comment Types
export interface Comment {
	id: string;
	content: string;
	resourceId: string;
	author?: {
		id: string;
		email: string;
		fullName: string;
		avatarUrl?: string | null;
	};
	createdAt: string;
	updatedAt: string;
}

export interface CreateCommentRequest {
	content: string;
	resourceId: string;
}

export interface UpdateCommentRequest {
	content: string;
}

