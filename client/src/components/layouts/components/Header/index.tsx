import { Layout, Avatar, Dropdown, Button, Typography } from "antd";
import type { MenuProps } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAvatarUrl } from "@/utils/avatar.utils";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
	collapsed: boolean;
	onToggleCollapse: () => void;
}

/**
 * Main Header Component
 * Displays navigation toggle, user info, and user dropdown menu
 */
export const Header: React.FC<HeaderProps> = ({ collapsed, onToggleCollapse }) => {
	const navigate = useNavigate();
	const { user, logout, isAdmin, isSubAdmin, isLecturer } = useAuth();

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

	return (
		<AntHeader className="bg-white! px-6! flex! items-center! justify-between! border-b! border-slate-200/80! shrink-0! shadow-md! backdrop-blur-md! bg-white/95! relative z-10">
			<div className="flex items-center gap-4">
				<Button
					type="text"
					icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
					onClick={onToggleCollapse}
					className="text-lg! text-slate-700! hover:bg-[#D9F0FF]! hover:text-[#1e40af]! rounded-lg! transition-all! duration-200! w-10! h-10! flex! items-center! justify-center!"
				/>
				<div className="hidden md:block h-6 w-px bg-slate-200" />
				<div className="hidden md:block">
					<Text className="text-sm text-slate-600">
						{isAdmin && "Quản trị hệ thống"}
						{isSubAdmin && "Quản trị khoa"}
						{isLecturer && "Giảng viên"}
					</Text>
				</div>
			</div>

			<Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
				<div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50/80 px-4 py-2.5 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200/60 hover:shadow-sm bg-white/50 backdrop-blur-sm">
					<div className="text-right hidden sm:block">
						<div className="font-semibold text-sm text-slate-900 leading-tight">
							{user?.fullName}
						</div>
						<div className="text-xs text-slate-500 mt-0.5">
							{user?.role === "ADMIN" && "Quản trị viên"}
							{user?.role === "SUB_ADMIN" && "Quản trị khoa"}
							{user?.role === "LECTURER" && "Giảng viên"}
						</div>
					</div>
					<Avatar
						size="large"
						src={getAvatarUrl(user?.avatarUrl)}
						icon={<UserOutlined />}
						className="border-2! border-white! shadow-lg! ring-2 ring-[#D9F0FF]/50! transition-all! duration-200! hover:ring-[#A3D5FF]!"
						style={{
							backgroundColor: "#83C9F4",
						}}
					/>
				</div>
			</Dropdown>
		</AntHeader>
	);
};

