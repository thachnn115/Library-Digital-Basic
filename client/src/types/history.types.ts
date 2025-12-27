// History Types
import type { Resource } from './resource.types';

export type HistoryAction = 'VIEW' | 'DOWNLOAD' | 'UPLOAD';

export interface History {
	id: number;
	action: HistoryAction;
	resource: Resource;
	createdAt: string;
}

export interface HistoryFilterParams {
	userId?: string | number;
	action?: HistoryAction;
	page?: number;
	size?: number;
}

