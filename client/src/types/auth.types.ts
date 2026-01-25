// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: UserInfo;
  mustChangePassword?: boolean;
}

export interface UserInfo {
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
  department?: DepartmentInfo | null;
  classroom?: ClassroomInfo | null;
  mustChangePassword?: boolean;
}

export interface DepartmentInfo {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

export interface ClassroomInfo {
  id: string;
  code: string;
  name: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

