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
		<AntHeader className="!bg-[#f8fafc]/80 backdrop-blur-md px-6 flex items-center justify-between border-b border-slate-200/60 shrink-0 sticky top-0 z-40 h-20 shadow-sm">
			<div className="flex items-center gap-4">
				<Button
					type="text"
					icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
					onClick={onToggleCollapse}
					className="text-lg text-slate-600 hover:bg-slate-100 rounded-lg transition-all w-10 h-10 flex items-center justify-center border border-transparent hover:border-slate-200"
				/>
				<div className="hidden md:block h-6 w-px bg-slate-200" />
				<div className="hidden lg:block ml-2">
					<Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-1">
						Vị trí hiện tại
					</Text>
					<Text className="text-[13px] font-semibold text-slate-700 block leading-none">
						{isAdmin && "Bàn làm việc • Quản trị viên"}
						{isSubAdmin && "Bàn làm việc • Quản trị khoa"}
						{isLecturer && "Bàn làm việc • Giảng viên"}
						{!isAdmin && !isSubAdmin && !isLecturer && "Trung tâm học liệu"}
					</Text>
				</div>
			</div>

			<Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
				<div className="flex items-center gap-3 cursor-pointer group hover:bg-white/80 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-slate-200 hover:shadow-sm">
					<div className="text-right hidden sm:block">
						<div className="font-bold text-[13px] text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
							{user?.fullName}
						</div>
						<div className="text-[11px] text-slate-500 mt-0.5 font-medium uppercase tracking-tight">
							{user?.role === "ADMIN" && "System Admin"}
							{user?.role === "SUB_ADMIN" && "Department Admin"}
							{user?.role === "LECTURER" && "Scientific Faculty"}
							{user?.role === "STUDENT" && "Student"}
						</div>
					</div>
					<Avatar
						size={40}
						src={getAvatarUrl(user?.avatarUrl)}
						icon={<UserOutlined />}
						className="border border-slate-200 shadow-sm shadow-blue-100 ring-4 ring-transparent group-hover:ring-blue-50 transition-all"
						style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
					/>
				</div>
			</Dropdown>
		</AntHeader>
	);
};

