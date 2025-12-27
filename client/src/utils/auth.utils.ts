import { APP_CONFIG, USER_ROLES } from '@/constants/app-config';
import type { UserInfo } from '@/types/auth.types';

// Token Management
export const getAccessToken = (): string | null => {
  return localStorage.getItem(APP_CONFIG.TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
};

export const removeAccessToken = (): void => {
  localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
};

// User Info Management
export const getUserInfo = (): UserInfo | null => {
  const userInfoStr = localStorage.getItem(APP_CONFIG.USER_INFO_KEY);
  if (!userInfoStr) return null;
  
  try {
    return JSON.parse(userInfoStr) as UserInfo;
  } catch {
    return null;
  }
};

export const setUserInfo = (userInfo: UserInfo): void => {
  localStorage.setItem(APP_CONFIG.USER_INFO_KEY, JSON.stringify(userInfo));
};

export const removeUserInfo = (): void => {
  localStorage.removeItem(APP_CONFIG.USER_INFO_KEY);
};

// Authentication Check
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// Role Check
export const hasRole = (role: string): boolean => {
  const userInfo = getUserInfo();
  if (!userInfo) return false;
  
  return userInfo.role === role || userInfo.type === role;
};

export const isAdmin = (): boolean => {
  return hasRole(USER_ROLES.ADMIN);
};

export const isSubAdmin = (): boolean => {
  return hasRole(USER_ROLES.SUB_ADMIN);
};

export const isLecturer = (): boolean => {
  return hasRole(USER_ROLES.LECTURER);
};

export const hasAnyRole = (roles: string[]): boolean => {
  return roles.some(role => hasRole(role));
};

// Logout
export const logout = (): void => {
  removeAccessToken();
  removeUserInfo();
};

