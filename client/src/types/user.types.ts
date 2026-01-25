// User Types (matches PublicUser from backend)
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  userIdentifier?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  dateOfBirth?: string | null;
  phone?: string | null;
  address?: string | null;
  type: 'ADMIN' | 'SUB_ADMIN' | 'LECTURER' | 'STUDENT';
  status: 'ACTIVE' | 'INACTIVE' | 'LOCK';
  avatarUrl?: string | null;
  department?: Department | null;
  classroom?: Classroom | null;
}

export interface UserRole {
  id: number;
  name: 'ADMIN' | 'SUB_ADMIN' | 'LECTURER' | 'STUDENT';
  description?: string;
}

export interface Department {
  id: string | number;
  name: string;
  code: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Classroom {
  id: string | number;
  name: string;
  code: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  userIdentifier?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  type: 'ADMIN' | 'SUB_ADMIN' | 'LECTURER' | 'STUDENT';
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCK';
  departmentId?: number;
  classroomId?: string;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  userIdentifier?: string;
  dateOfBirth?: string;
  address?: string;
  type?: 'ADMIN' | 'SUB_ADMIN' | 'LECTURER' | 'STUDENT';
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCK';
  departmentId?: number;
  classroomId?: string;
}

export interface UserFilterParams {
  keyword?: string;
  departmentId?: number;
  roleId?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  page?: number;
  size?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

