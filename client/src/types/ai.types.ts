// AI Chat Types
export interface AiMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

export interface AiChatRequest {
	message: string;
	history?: AiMessage[];
	systemPrompt?: string;
	model?: string;
}

export interface AiChatResponse {
	id: string;
	model: string;
	answer: string;
	finishReason?: string;
}

