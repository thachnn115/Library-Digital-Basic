// Statistics Types
import type { Resource } from './resource.types';

export interface TopUploaderResponse {
  userId: string;
  email: string;
  fullName: string;
  departmentId?: number;
  departmentName?: string;
  uploadCount: number;
}

export interface TopResourceResponse {
  resource: Resource;
  views: number;
  downloads: number;
  score?: number;
}

