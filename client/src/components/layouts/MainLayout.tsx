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
	const { user, isAdmin, isSubAdmin, isLecturer, isStudent, isAuthenticated } =
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

		if (isStudent) {
			return [
				{
					key: "/student/resources",
					icon: <FileTextOutlined />,
					label: "Học liệu của lớp",
				},
				{
					key: "/student/profile",
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
		<Layout className="min-h-screen bg-[#f8fafc] overflow-hidden">
			{/* Professional Sider */}
			<Sider
				trigger={null}
				collapsible
				collapsed={collapsed}
				breakpoint="lg"
				onBreakpoint={(broken) => {
					if (broken) setCollapsed(true);
				}}
				width={260}
				collapsedWidth={80}
				className="glass-effect !bg-white/80 border-r border-slate-200/60 transition-all duration-300 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
			>
				{/* Logo Section */}
				<div className="h-20 flex items-center px-6 border-b border-slate-100">
					<div className="flex items-center gap-3 overflow-hidden">
						<div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow-md shrink-0">
							📚
						</div>
						{!collapsed && (
							<div className="flex flex-col min-w-0">
								<Text className="text-sm font-bold text-slate-800 leading-tight truncate">
									UNIVERSITY LIBRARY
								</Text>
								<Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
									Hệ thống Học liệu
								</Text>
							</div>
						)}
					</div>
				</div>

				{/* Navigation Menu */}
				<div className="mt-6 flex-1 overflow-y-auto px-2">
					<Menu
						mode="inline"
						selectedKeys={[location.pathname]}
						items={menuItems}
						onClick={handleMenuClick}
						className="border-r-0 bg-transparent"
						theme="light"
					/>
				</div>
			</Sider>

			<Layout className="flex flex-col">
				{/* Refined Header */}
				<Header
					collapsed={collapsed}
					onToggleCollapse={() => setCollapsed(!collapsed)}
				/>

				{/* Optimized Content Area */}
				<Content className="p-6 md:p-8 overflow-y-auto relative z-10">
					<div className="max-w-[1400px] mx-auto page-fade-in min-h-full flex flex-col">
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
