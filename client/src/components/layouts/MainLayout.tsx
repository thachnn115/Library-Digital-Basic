import { useState, useMemo } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Typography } from "antd";
import type { MenuProps } from "antd";
import {
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	HomeOutlined,
	SearchOutlined,
	UploadOutlined,
	FileTextOutlined,
	UserOutlined,
	LogoutOutlined,
	DashboardOutlined,
	TeamOutlined,
	AppstoreOutlined,
	CheckCircleOutlined,
	BarChartOutlined,
	QuestionCircleOutlined,
	MessageOutlined,
	RobotOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/common/Footer";
import { ChangePasswordReminderModal } from "@/components/modules/auth/ChangePasswordReminderModal";
import { getAvatarUrl } from "@/utils/avatar.utils";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
	children: React.ReactNode;
}

/**
 * Main layout with header, sidebar, and content area
 * Different navigation menu based on user role
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	const [collapsed, setCollapsed] = useState(false);
	const [passwordReminderDismissed, setPasswordReminderDismissed] =
		useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout, isAdmin, isSubAdmin, isLecturer, isAuthenticated } =
		useAuth();

	// Calculate if password reminder should be shown (derived state)
	// Only show if user needs to change password, is authenticated, and hasn't dismissed it
	const showPasswordReminder = useMemo(
		() =>
			!!(
				user?.mustChangePassword &&
				isAuthenticated &&
				!passwordReminderDismissed
			),
		[user?.mustChangePassword, isAuthenticated, passwordReminderDismissed]
	);

	// Menu items based on role
	const getMenuItems = (): MenuProps["items"] => {
		if (isAdmin) {
			return [
				{
					key: "/admin/dashboard",
					icon: <DashboardOutlined />,
					label: "Tổng quan",
				},
				{
					key: "/admin/users",
					icon: <TeamOutlined />,
					label: "Quản lý người dùng",
				},
				{
					key: "/admin/categories",
					icon: <AppstoreOutlined />,
					label: "Quản lý danh mục",
				},
				{
					key: "/admin/resources/approval",
					icon: <CheckCircleOutlined />,
					label: "Duyệt học liệu",
				},
				{
					key: "/admin/stats",
					icon: <BarChartOutlined />,
					label: "Thống kê",
				},
				{
					key: "/ai/chat",
					icon: <RobotOutlined />,
					label: "Trợ lý AI",
				},
			];
		}

		if (isSubAdmin) {
			return [
				{
					key: "/sub-admin/dashboard",
					icon: <DashboardOutlined />,
					label: "Tổng quan khoa",
				},
				{
					key: "/sub-admin/users",
					icon: <TeamOutlined />,
					label: "Quản lý giảng viên",
				},
				{
					key: "/sub-admin/courses",
					icon: <AppstoreOutlined />,
					label: "Quản lý học phần",
				},
			{
				key: "/sub-admin/stats",
				icon: <BarChartOutlined />,
				label: "Thống kê khoa",
			},
			{
				key: "/admin/resources/approval",
				icon: <FileTextOutlined />,
				label: "Duyệt học liệu",
			},
			{
				key: "/ai/chat",
				icon: <RobotOutlined />,
				label: "Trợ lý AI",
			},
			];
		}

		if (isLecturer) {
			return [
				{
					key: "/",
					icon: <HomeOutlined />,
					label: "Trang chủ",
				},
				{
					key: "/resources/search",
					icon: <SearchOutlined />,
					label: "Tìm kiếm học liệu",
				},
				{
					key: "/resources/upload",
					icon: <UploadOutlined />,
					label: "Tải lên",
				},
				{
					key: "/resources/my-resources",
					icon: <FileTextOutlined />,
					label: "Học liệu của tôi",
				},
				{
					key: "/profile",
					icon: <UserOutlined />,
					label: "Hồ sơ cá nhân",
				},
				{
					key: "/guide",
					icon: <QuestionCircleOutlined />,
					label: "Hướng dẫn",
				},
				{
					key: "/contact",
					icon: <MessageOutlined />,
					label: "Liên hệ - Góp ý",
				},
				{
					key: "/ai/chat",
					icon: <RobotOutlined />,
					label: "Trợ lý AI",
				},
			];
		}

		return [];
	};

	const menuItems = getMenuItems();

	// User dropdown menu
	const userMenuItems: MenuProps["items"] = [
		{
			key: "profile",
			icon: <UserOutlined />,
			label: "Hồ sơ cá nhân",
			onClick: () => navigate("/profile"),
		},
		{
			type: "divider",
		},
		{
			key: "logout",
			icon: <LogoutOutlined />,
			label: "Đăng xuất",
			onClick: logout,
		},
	];

	const handleMenuClick: MenuProps["onClick"] = (e) => {
		navigate(e.key);
	};

	return (
		<Layout className="min-h-screen flex flex-col bg-slate-50">
			<Sider
				trigger={null}
				collapsible
				collapsed={collapsed}
				breakpoint="lg"
				onBreakpoint={(broken) => {
					if (broken) setCollapsed(true);
				}}
				className="border-r-0! shadow-lg"
				style={{
					backgroundColor: "#A3D5FF",
				}}
				width={220}
				collapsedWidth={64}
			>
				<div className="h-14 flex items-center border-b border-white/20 px-4">
					{!collapsed ? (
						<div className="flex items-center gap-3 w-full">
							<div className="text-lg shrink-0">📚</div>
							<Text className="text-base font-bold text-slate-800 leading-normal whitespace-nowrap">
								Quản lý Học liệu
							</Text>
						</div>
					) : (
						<div className="flex items-center justify-center w-full">
							<div className="text-lg">📚</div>
						</div>
					)}
				</div>
				<Menu
					mode="inline"
					selectedKeys={[location.pathname]}
					items={menuItems}
					onClick={handleMenuClick}
					className="border-r-0! bg-transparent! mt-2! px-2!"
					style={{
						backgroundColor: "transparent",
						color: "#1e293b",
					}}
				/>
			</Sider>
			<Layout className="flex-1 flex flex-col">
				<Header className="bg-white! px-6! flex! items-center! justify-between! border-b! border-slate-200! shrink-0! shadow-sm backdrop-blur-sm">
					<Button
						type="text"
						icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						onClick={() => setCollapsed(!collapsed)}
						className="text-lg! text-slate-700! hover:bg-[#D9F0FF]! hover:text-[#1e40af]!"
					/>

					<Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
						<div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-4 py-2 rounded-lg transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm">
							<div className="text-right">
								<div className="font-semibold text-sm text-slate-900">
									{user?.fullName}
								</div>
								<div className="text-xs text-slate-500">
									{user?.role === "ADMIN" && "Quản trị viên"}
									{user?.role === "SUB_ADMIN" && "Quản trị khoa"}
									{user?.role === "LECTURER" && "Giảng viên"}
								</div>
							</div>
							<Avatar
								size="large"
								src={getAvatarUrl(user?.avatarUrl)}
								icon={<UserOutlined />}
								className="border-2! border-white! shadow-lg! ring-2 ring-[#D9F0FF]"
								style={{
									backgroundColor: "#83C9F4",
								}}
							/>
						</div>
					</Dropdown>
				</Header>
				<Content className="m-6 flex-1 overflow-auto">
					<div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 min-h-[60vh]">
						{children}
					</div>
				</Content>
				<Footer />
			</Layout>

			{/* Change Password Reminder Modal */}
			<ChangePasswordReminderModal
				open={showPasswordReminder}
				onCancel={() => setPasswordReminderDismissed(true)}
			/>
		</Layout>
	);
};

export default MainLayout;
