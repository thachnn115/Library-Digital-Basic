import { APP_CONFIG } from "@/constants/app-config";

// File Validation
export const isValidFileType = (file: File): boolean => {
	return (APP_CONFIG.ALLOWED_FILE_TYPES as readonly string[]).includes(
		file.type
	);
};

export const isValidFileSize = (file: File): boolean => {
	return file.size <= APP_CONFIG.MAX_FILE_SIZE;
};

// Check if file is a Word or PowerPoint file (now allowed)
export const isWordOrPowerPointFile = (_: File): boolean => {
	// Previously checked for .doc, .docx, .ppt, .pptx to block them.
	// Now we allow them, so we return false to indicate "not a blocked file type"
	return false;
};

export const validateFile = (
	file: File
): { valid: boolean; error?: string } => {
	// Check file size first
	if (!isValidFileSize(file)) {
		return {
			valid: false,
			error: `Kích thước file vượt quá ${APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
				}MB`,
		};
	}

	// Check if file is Word or PowerPoint (now allowed, so this block won't trigger if isWordOrPowerPointFile returns false)
	if (isWordOrPowerPointFile(file)) {
		return {
			valid: false,
			error:
				"File Word (.doc, .docx) và PowerPoint (.ppt, .pptx) không được phép. Vui lòng chuyển đổi sang PDF trước khi tải lên.",
		};
	}

	// Check file type
	if (!isValidFileType(file)) {
		return {
			valid: false,
			error: "Định dạng file không được hỗ trợ",
		};
	}

	return { valid: true };
};

// File Extension
export const getFileExtension = (fileName: string): string => {
	const lastDotIndex = fileName.lastIndexOf(".");
	if (lastDotIndex === -1) return "";
	return fileName.slice(lastDotIndex);
};

export const getFileNameWithoutExtension = (fileName: string): string => {
	const lastDotIndex = fileName.lastIndexOf(".");
	if (lastDotIndex === -1) return fileName;
	return fileName.slice(0, lastDotIndex);
};

// File Type Icons
export const getFileIcon = (fileType: string): string => {
	if (fileType.includes("pdf")) return "file-pdf";
	if (fileType.includes("word") || fileType.includes("document"))
		return "file-word";
	if (fileType.includes("powerpoint") || fileType.includes("presentation"))
		return "file-ppt";
	if (fileType.includes("excel") || fileType.includes("spreadsheet"))
		return "file-excel";
	if (fileType.includes("image")) return "file-image";
	if (fileType.includes("video")) return "file-video";
	return "file";
};

// Download File
export const downloadFile = (url: string, fileName: string): void => {
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.target = "_blank";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

// File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});
};

// Create File from Blob
export const createFileFromBlob = (blob: Blob, fileName: string): File => {
	return new File([blob], fileName, { type: blob.type });
};
