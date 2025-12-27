// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Hệ thống Quản trị Học liệu Điện tử',
  APP_SHORT_NAME: 'Library Digital',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  
  // File Upload
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
  ],
  ALLOWED_FILE_EXTENSIONS: [
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.xls',
    '.xlsx',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.mp4',
  ],
  
  // Date Format
  DATE_FORMAT: 'DD/MM/YYYY',
  DATE_TIME_FORMAT: 'DD/MM/YYYY HH:mm',
  TIME_FORMAT: 'HH:mm',
  
  // Debounce
  SEARCH_DEBOUNCE_MS: 500,
  
  // Token
  TOKEN_KEY: 'access_token',
  USER_INFO_KEY: 'user_info',
  
  // API
  API_TIMEOUT: 30000,
  
  // Toast Duration
  TOAST_SUCCESS_DURATION: 3000,
  TOAST_ERROR_DURATION: 5000,
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SUB_ADMIN: 'SUB_ADMIN',
  LECTURER: 'LECTURER',
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
} as const;

// Approval Status
export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

// History Actions
export const HISTORY_ACTIONS = {
  UPLOAD: 'UPLOAD',
  VIEW: 'VIEW',
  DOWNLOAD: 'DOWNLOAD',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

// Sort Order
export const SORT_ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

// Resource Category
export const RESOURCE_CATEGORY = {
  LECTURE_SLIDE: 'LECTURE_SLIDE',
  EXERCISE: 'EXERCISE',
  EXAM: 'EXAM',
  REFERENCE: 'REFERENCE',
  VIDEO: 'VIDEO',
  OTHER: 'OTHER',
} as const;

