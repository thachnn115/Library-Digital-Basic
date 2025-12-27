import type { AiChatRequest, AiChatResponse } from "@/types/ai.types";
import type { ApiResponse } from "@/types/api.types";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import apiClient from "./client";

/**
 * AI Chat API Service
 */
export const aiApi = {
	/**
	 * Chat with AI
	 */
	chat: async (data: AiChatRequest): Promise<AiChatResponse> => {
		const response = await apiClient.post<ApiResponse<AiChatResponse>>(
			API_ENDPOINTS.AI.CHAT,
			data
		);
		return response.data.data;
	},
};

