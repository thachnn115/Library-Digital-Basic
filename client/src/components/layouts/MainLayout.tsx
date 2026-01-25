import { useState, useMemo } from "react";
import { Layout, Menu, Typography } from "antd";
import type { MenuProps } from "antd";
import {
	HomeOutlined,
	SearchOutlined,
	UploadOutlined,
	FileTextOutlined,
	UserOutlined,
	DashboardOutlined,
	TeamOutlined,
	AppstoreOutlined,
	BarChartOutlined,
	QuestionCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layouts/components/Header";
import { Footer } from "@/components/layouts/components/Footer";
import { ChangePasswordReminderModal } from "@/components/modules/auth/ChangePasswordReminderModal";

const { Sider, Content } = Layout;
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
	const { user, isAdmin, isSubAdmin, isLecturer, isAuthenticated } =
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
					key: "/admin/stats",
					icon: <BarChartOutlined />,
					label: "Thống kê",
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
			];
		}

		return [];
	};

	const menuItems = getMenuItems();

	const handleMenuClick: MenuProps["onClick"] = (e) => {
		navigate(e.key);
	};

	return (
		<Layout className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
			<Sider
				trigger={null}
				collapsible
				collapsed={collapsed}
				breakpoint="lg"
				onBreakpoint={(broken) => {
					if (broken) setCollapsed(true);
				}}
				className="border-r-0! shadow-xl! relative overflow-hidden"
				style={{
					background: "linear-gradient(180deg, #A3D5FF 0%, #8BC5F0 100%)",
				}}
				width={240}
				collapsedWidth={80}
			>
				{/* Decorative gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
				
				{/* Logo/Brand Section */}
				<div className="h-16 flex items-center border-b border-white/30 px-4 relative z-10 bg-white/5 backdrop-blur-sm">
					{!collapsed ? (
						<div className="flex items-center gap-3 w-full">
							<div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shadow-md shrink-0">
								📚
							</div>
							<div className="flex-1 min-w-0">
								<Text className="text-base font-bold text-slate-800 leading-tight block truncate">
									Quản lý Học liệu
								</Text>
								<Text className="text-xs text-slate-600/80 block truncate">
									Thư viện Số
								</Text>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-center w-full">
							<div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shadow-md">
								📚
							</div>
						</div>
					)}
				</div>
				
				{/* Menu */}
				<Menu
					mode="inline"
					selectedKeys={[location.pathname]}
					items={menuItems}
					onClick={handleMenuClick}
					className="border-r-0! bg-transparent! mt-4! px-3! relative z-10"
					style={{
						backgroundColor: "transparent",
						color: "#1e293b",
					}}
					theme="light"
				/>
			</Sider>
			<Layout className="flex-1 flex flex-col">
				{/* Header */}
				<Header
					collapsed={collapsed}
					onToggleCollapse={() => setCollapsed(!collapsed)}
				/>
				
				{/* Content */}
				<Content className="m-6 flex-1 overflow-auto">
					<div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 md:p-8 min-h-[60vh] backdrop-blur-sm bg-white/95">
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
