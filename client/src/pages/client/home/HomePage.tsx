import { Card, Row, Col, Button, Space, Typography, Statistic } from "antd";
import {
	SearchOutlined,
	UploadOutlined,
	FileTextOutlined,
	RobotOutlined,
	QuestionCircleOutlined,
	ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

const { Title, Paragraph } = Typography;

/**
 * Home Page - Lecturer dashboard with quick actions
 */
const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Welcome Section */}
			<Card className="mb-6" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
				<Row align="middle" gutter={[24, 24]}>
					<Col xs={24} md={16}>
						<Title level={2} style={{ color: "white", margin: 0 }}>
							Chào mừng trở lại, {user?.fullName || "Giảng viên"}!
						</Title>
						<Paragraph style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "16px", marginTop: "8px" }}>
							Hệ thống quản lý học liệu số giúp bạn dễ dàng tìm kiếm, tải lên và quản lý tài liệu giảng dạy.
						</Paragraph>
					</Col>
					<Col xs={24} md={8} style={{ textAlign: "right" }}>
						<Space direction="vertical" size="large">
							<Statistic
								title={<span style={{ color: "rgba(255, 255, 255, 0.9)" }}>Khoa</span>}
								value={user?.department?.name || "N/A"}
								valueStyle={{ color: "white", fontSize: "20px" }}
							/>
						</Space>
					</Col>
				</Row>
			</Card>

			{/* Quick Actions */}
			<Row gutter={[16, 16]} className="mb-6">
				<Col xs={24} sm={12} md={8}>
					<Card
						hoverable
						className="h-full"
						onClick={() => navigate(ROUTES.RESOURCES_SEARCH)}
						style={{ cursor: "pointer" }}
					>
						<Space direction="vertical" size="middle" style={{ width: "100%" }}>
							<div style={{ fontSize: "48px", color: "#1890ff", textAlign: "center" }}>
								<SearchOutlined />
							</div>
							<Title level={4} style={{ textAlign: "center", margin: 0 }}>
								Tìm kiếm học liệu
							</Title>
							<Paragraph style={{ textAlign: "center", color: "#666", margin: 0 }}>
								Tìm kiếm và duyệt các tài liệu học tập có sẵn trong hệ thống
							</Paragraph>
							<Button
								type="primary"
								block
								icon={<ArrowRightOutlined />}
								onClick={(e) => {
									e.stopPropagation();
									navigate(ROUTES.RESOURCES_SEARCH);
								}}
							>
								Đi đến tìm kiếm
							</Button>
						</Space>
					</Card>
				</Col>

				<Col xs={24} sm={12} md={8}>
					<Card
						hoverable
						className="h-full"
						onClick={() => navigate(ROUTES.RESOURCES_UPLOAD)}
						style={{ cursor: "pointer" }}
					>
						<Space direction="vertical" size="middle" style={{ width: "100%" }}>
							<div style={{ fontSize: "48px", color: "#52c41a", textAlign: "center" }}>
								<UploadOutlined />
							</div>
							<Title level={4} style={{ textAlign: "center", margin: 0 }}>
								Tải lên học liệu
							</Title>
							<Paragraph style={{ textAlign: "center", color: "#666", margin: 0 }}>
								Chia sẻ tài liệu giảng dạy của bạn với cộng đồng
							</Paragraph>
							<Button
								type="primary"
								block
								icon={<ArrowRightOutlined />}
								onClick={(e) => {
									e.stopPropagation();
									navigate(ROUTES.RESOURCES_UPLOAD);
								}}
							>
								Đi đến tải lên
							</Button>
						</Space>
					</Card>
				</Col>

				<Col xs={24} sm={12} md={8}>
					<Card
						hoverable
						className="h-full"
						onClick={() => navigate(ROUTES.MY_RESOURCES)}
						style={{ cursor: "pointer" }}
					>
						<Space direction="vertical" size="middle" style={{ width: "100%" }}>
							<div style={{ fontSize: "48px", color: "#722ed1", textAlign: "center" }}>
								<FileTextOutlined />
							</div>
							<Title level={4} style={{ textAlign: "center", margin: 0 }}>
								Học liệu của tôi
							</Title>
							<Paragraph style={{ textAlign: "center", color: "#666", margin: 0 }}>
								Xem và quản lý các tài liệu bạn đã tải lên, xem và tải xuống
							</Paragraph>
							<Button
								type="primary"
								block
								icon={<ArrowRightOutlined />}
								onClick={(e) => {
									e.stopPropagation();
									navigate(ROUTES.MY_RESOURCES);
								}}
							>
								Xem học liệu
							</Button>
						</Space>
					</Card>
				</Col>
			</Row>

			{/* Additional Features */}
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12}>
					<Card
						hoverable
						onClick={() => navigate(ROUTES.AI_CHAT)}
						style={{ cursor: "pointer" }}
					>
						<Space>
							<RobotOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
							<div>
								<Title level={5} style={{ margin: 0 }}>
									Trợ lý AI
								</Title>
								<Paragraph style={{ margin: 0, color: "#666" }}>
									Nhận hỗ trợ từ trợ lý AI về học liệu và hệ thống
								</Paragraph>
							</div>
						</Space>
					</Card>
				</Col>

				<Col xs={24} sm={12}>
					<Card
						hoverable
						onClick={() => navigate(ROUTES.GUIDE)}
						style={{ cursor: "pointer" }}
					>
						<Space>
							<QuestionCircleOutlined style={{ fontSize: "32px", color: "#52c41a" }} />
							<div>
								<Title level={5} style={{ margin: 0 }}>
									Hướng dẫn sử dụng
								</Title>
								<Paragraph style={{ margin: 0, color: "#666" }}>
									Xem hướng dẫn chi tiết về cách sử dụng hệ thống
								</Paragraph>
							</div>
						</Space>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default HomePage;

