import { AiChatWidget } from "@/components/modules/ai/AiChatWidget";

/**
 * AI Chat Page - Chat with AI assistant
 */
const AiChatPage: React.FC = () => {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="max-w-4xl mx-auto">
				<AiChatWidget />
			</div>
		</div>
	);
};

export default AiChatPage;

