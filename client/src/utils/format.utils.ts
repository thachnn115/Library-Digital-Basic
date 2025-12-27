import dayjs from 'dayjs';
import { APP_CONFIG } from '@/constants/app-config';

// Date Formatting
export const formatDate = (date: string | Date, format?: string): string => {
  return dayjs(date).format(format || APP_CONFIG.DATE_FORMAT);
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format(APP_CONFIG.DATE_TIME_FORMAT);
};

export const formatTime = (date: string | Date): string => {
  return dayjs(date).format(APP_CONFIG.TIME_FORMAT);
};

export const getRelativeTime = (date: string | Date): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diffInSeconds = now.diff(target, 'second');
  
  if (diffInSeconds < 60) {
    return 'Vừa xong';
  }
  
  const diffInMinutes = now.diff(target, 'minute');
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  
  const diffInHours = now.diff(target, 'hour');
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }
  
  const diffInDays = now.diff(target, 'day');
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }
  
  return formatDate(date);
};

// File Size Formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Number Formatting
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// String Formatting
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

