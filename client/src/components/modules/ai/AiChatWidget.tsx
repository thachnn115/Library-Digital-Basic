import { useState, useRef, useEffect } from "react";
import { Card, Input, Button, Space, Avatar, Spin } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { aiApi } from "@/api/ai.api";
import type { AiMessage } from "@/types/ai.types";
import { toast } from "sonner";

const { TextArea } = Input;

interface AiChatWidgetProps {
	className?: string;
}

/**
 * AI Chat Widget Component
 */
export const AiChatWidget: React.FC<AiChatWidgetProps> = ({ className }) => {
	const [message, setMessage] = useState("");
	const [history, setHistory] = useState<AiMessage[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const chatMutation = useMutation({
		mutationFn: (data: { message: string; history: AiMessage[] }) =>
			aiApi.chat({
				message: data.message,
				history: data.history.length > 0 ? data.history : undefined,
			}),
		onSuccess: (response) => {
			// Add user message and AI response to history
			setHistory((prev) => [
				...prev,
				{ role: "user", content: message },
				{ role: "assistant", content: response.answer },
			]);
			setMessage("");
		},
		onError: (error: unknown) => {
			console.error("AI Chat error:", error);
			// Extract error message from AxiosError if available
			let errorMessage = "Không thể kết nối với AI. Vui lòng thử lại sau.";
			let showDetailedError = false;
			
			if (error && typeof error === "object" && "response" in error) {
				const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
				const responseData = axiosError.response?.data;
				
				if (responseData) {
					// Check for OpenRouter API errors
					if (responseData.message) {
						errorMessage = responseData.message;
						showDetailedError = true;
						
						// Provide user-friendly message for common errors
						if (errorMessage.includes("Unauthorized") || errorMessage.includes("OpenRouter API error")) {
							errorMessage = "Tính năng AI Chat hiện chưa khả dụng. Vui lòng liên hệ quản trị viên để được hỗ trợ.";
						} else if (errorMessage.includes("Cannot connect")) {
							errorMessage = "Không thể kết nối đến dịch vụ AI. Vui lòng thử lại sau.";
						}
					} else if (responseData.error) {
						errorMessage = responseData.error;
						showDetailedError = true;
					} else if (typeof responseData === "string") {
						errorMessage = responseData;
						showDetailedError = true;
					}
				}
			}
			
			toast.error(errorMessage, {
				duration: 5000, // Show for 5 seconds
			});
		},
	});

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [history]);

	const handleSubmit = () => {
		if (!message.trim()) {
			toast.warning("Vui lòng nhập câu hỏi");
			return;
		}
		chatMutation.mutate({ message: message.trim(), history });
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<Card
			title={
				<Space>
					<RobotOutlined />
					<span>Trợ lý AI</span>
				</Space>
			}
			className={className}
		>
			<div className="space-y-4">
				{/* Chat Messages */}
				<div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-4">
					{history.length === 0 ? (
						<div className="text-center text-gray-500 py-8">
							<p>Chào mừng bạn đến với Trợ lý AI!</p>
							<p className="text-sm mt-2">
								Hãy đặt câu hỏi về học liệu hoặc hệ thống.
							</p>
						</div>
					) : (
						history.map((msg, index) => (
							<div
								key={index}
								className={`flex gap-3 ${
									msg.role === "user" ? "justify-end" : "justify-start"
								}`}
							>
								{msg.role === "assistant" && (
									<Avatar icon={<RobotOutlined />} className="bg-blue-500" />
								)}
								<div
									className={`max-w-[70%] rounded-lg p-3 ${
										msg.role === "user"
											? "bg-blue-500 text-white"
											: "bg-white border"
									}`}
								>
									{msg.content}
								</div>
								{msg.role === "user" && (
									<Avatar icon={<UserOutlined />} className="bg-gray-400" />
								)}
							</div>
						))
					)}
					{chatMutation.isPending && (
						<div className="flex gap-3 justify-start">
							<Avatar icon={<RobotOutlined />} className="bg-blue-500" />
							<div className="bg-white border rounded-lg p-3">
								<Spin size="small" />
								<span className="ml-2">Đang suy nghĩ...</span>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className="space-y-2">
					<TextArea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Nhập câu hỏi của bạn..."
						rows={3}
						maxLength={500}
						showCount
						disabled={chatMutation.isPending}
					/>
					<Button
						type="primary"
						icon={<SendOutlined />}
						onClick={handleSubmit}
						loading={chatMutation.isPending}
						block
					>
						Gửi
					</Button>
				</div>
			</div>
		</Card>
	);
};

