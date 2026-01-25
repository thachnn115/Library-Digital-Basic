import type { ApiResponse } from "@/types/api.types";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import apiClient from "./client";

/**
 * Student Import API Service
 */
export const studentApi = {
	/**
	 * Import students from Excel (ADMIN only)
	 */
	importStudents: async (file: File): Promise<number> => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await apiClient.post<ApiResponse<number>>(
			API_ENDPOINTS.STUDENT.IMPORT,
			formData
		);
		return response.data.data;
	},

	/**
	 * Download student import template (ADMIN only)
	 */
	downloadImportTemplate: async (): Promise<{ blob: Blob; filename: string }> => {
		const response = await apiClient.get(
			API_ENDPOINTS.STUDENT.IMPORT_TEMPLATE,
			{ responseType: "blob" }
		);
		const disposition =
			(response.headers &&
				(response.headers["content-disposition"] ||
					response.headers["Content-Disposition"])) ||
			"";
		let filename = "student-import-template.xlsx";
		const match = /filename=\"?([^\";]+)\"?/i.exec(disposition);
		if (match && match[1]) {
			filename = match[1];
		}
		return { blob: response.data as Blob, filename };
	},
};
