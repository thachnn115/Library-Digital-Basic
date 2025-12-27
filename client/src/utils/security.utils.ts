/**
 * Security utilities for XSS prevention and input sanitization
 */

/**
 * Sanitize HTML string to prevent XSS attacks
 * Removes potentially dangerous HTML tags and attributes
 */
export const sanitizeHtml = (html: string): string => {
	if (!html) return '';

	// Create a temporary div element
	const div = document.createElement('div');
	div.textContent = html;
	return div.innerHTML;
};

/**
 * Escape HTML special characters
 */
export const escapeHtml = (text: string): string => {
	if (!text) return '';

	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	};

	return text.replace(/[&<>"']/g, (char) => map[char] || char);
};

/**
 * Sanitize user input by removing potentially dangerous characters
 */
export const sanitizeInput = (input: string): string => {
	if (!input) return '';

	// Remove null bytes and control characters (excluding common whitespace)
	// eslint-disable-next-line no-control-regex
	let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

	// Trim whitespace
	sanitized = sanitized.trim();

	// Limit length to prevent DoS
	const maxLength = 10000;
	if (sanitized.length > maxLength) {
		sanitized = sanitized.substring(0, maxLength);
	}

	return sanitized;
};

/**
 * Validate URL to prevent XSS through href/src attributes
 */
export const isValidUrl = (url: string): boolean => {
	if (!url) return false;

	try {
		const parsedUrl = new URL(url);
		// Only allow http, https, and data URLs
		return ['http:', 'https:', 'data:'].includes(parsedUrl.protocol);
	} catch {
		return false;
	}
};

/**
 * Sanitize URL for safe use in href/src attributes
 */
export const sanitizeUrl = (url: string): string => {
	if (!url) return '';

	// If it's a valid URL, return it
	if (isValidUrl(url)) {
		return url;
	}

	// If it starts with /, it's a relative URL (safe)
	if (url.startsWith('/')) {
		return url;
	}

	// Otherwise, return empty string or a safe default
	return '#';
};

