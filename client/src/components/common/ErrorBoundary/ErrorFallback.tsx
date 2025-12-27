import { Card, Button, Typography } from "antd";
import { ReloadOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

interface ErrorFallbackProps {
	error: Error | null;
	onReset: () => void;
}

/**
 * Error Fallback UI Component
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
	error,
	onReset,
}) => {
	const navigate = useNavigate();

	const handleGoHome = () => {
		try {
			navigate("/");
		} catch {
			// Fallback to window.location if navigate fails
			window.location.href = "/";
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="max-w-2xl w-full">
				<div className="text-center">
					<div className="text-6xl mb-4">⚠️</div>
					<Title level={2}>Đã xảy ra lỗi</Title>
					<Paragraph className="text-gray-600 mb-6">
						Xin lỗi, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại hoặc
						liên hệ với bộ phận hỗ trợ nếu vấn đề vẫn tiếp tục.
					</Paragraph>

					{error && (
						<Card
							size="small"
							className="bg-red-50 border-red-200 mb-6 text-left"
						>
							<Paragraph className="mb-0">
								<strong>Chi tiết lỗi:</strong>
							</Paragraph>
							<code className="text-sm text-red-700 break-all">
								{error.message || "Unknown error"}
							</code>
						</Card>
					)}

					<div className="flex gap-3 justify-center">
						<Button
							type="primary"
							icon={<ReloadOutlined />}
							onClick={onReset}
							size="large"
						>
							Thử lại
						</Button>
						<Button icon={<HomeOutlined />} onClick={handleGoHome} size="large">
							Về trang chủ
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
};
