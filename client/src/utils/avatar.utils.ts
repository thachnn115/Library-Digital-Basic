/**
 * Utility functions for avatar handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Convert file system path to accessible URL
 * 
 * Backend returns file system paths like:
 * /Users/.../server/uploads/avatars/filename.png
 * 
 * We convert to:
 * http://localhost:8080/uploads/avatars/filename.png
 * 
 * ⚠️ IMPORTANT: This assumes backend has an endpoint to serve static files at /uploads/avatars/
 * If backend doesn't have ResourceHandler configured, avatars won't display.
 * Backend needs to add:
 * - WebMvcConfigurer with addResourceHandlers mapping /uploads/** to file system
 * - Or a controller endpoint to serve avatar files
 */
export function getAvatarUrl(avatarPath?: string | null): string | undefined {
	if (!avatarPath) {
		return undefined;
	}

	// If already a URL (starts with http:// or https://), return as is
	if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
		return avatarPath;
	}

	// Extract filename from file system path
	// Path format: /Users/.../server/uploads/avatars/filename.png
	// or: uploads/avatars/filename.png
	const filename = avatarPath.split('/').pop();
	if (!filename) {
		return undefined;
	}

	// Construct URL
	// Note: Backend must serve files at /uploads/avatars/ for this to work
	return `${API_BASE_URL}/uploads/avatars/${filename}`;
}

