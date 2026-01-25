import { Table, Button, Space, Tag, Avatar, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
	EditOutlined,
	DeleteOutlined,
	KeyOutlined,
	UserOutlined,
} from "@ant-design/icons";
import type { User } from "@/types/user.types";
import { getAvatarUrl } from "@/utils/avatar.utils";

interface UserTableProps {
	users: User[];
	loading?: boolean;
	currentUser?: User | null;
	onEdit: (user: User) => void;
	onDelete: (user: User) => void;
	onResetPassword: (user: User) => void;
}

/**
 * User Table Component
 * Displays users in a table with actions
 */
export const UserTable: React.FC<UserTableProps> = ({
	users,
	loading = false,
	currentUser,
	onEdit,
	onDelete,
	onResetPassword,
}) => {
	// Check if current user can delete target user
	const canDeleteUser = (targetUser: User): boolean => {
		if (!currentUser) return true; // Admin page doesn't pass currentUser, allow all

		const currentUserRole = currentUser.role || currentUser.type;
		const targetUserRole = targetUser.role || targetUser.type;

		// SUB_ADMIN cannot delete other SUB_ADMIN
		if (currentUserRole === "SUB_ADMIN" && targetUserRole === "SUB_ADMIN") {
			return false;
		}

		// SUB_ADMIN cannot delete ADMIN
		if (currentUserRole === "SUB_ADMIN" && targetUserRole === "ADMIN") {
			return false;
		}

		return true;
	};

	const getDeleteDisabledReason = (targetUser: User): string | null => {
		if (!currentUser) return null;

		const currentUserRole = currentUser.role || currentUser.type;
		const targetUserRole = targetUser.role || targetUser.type;

		if (currentUserRole === "SUB_ADMIN" && targetUserRole === "SUB_ADMIN") {
			return "Bạn không có quyền xóa quản trị khoa khác";
		}

		if (currentUserRole === "SUB_ADMIN" && targetUserRole === "ADMIN") {
			return "Bạn không có quyền xóa quản trị viên";
		}

		return null;
	};
	const columns: ColumnsType<User> = [
		{
			title: <div className="text-center">Người dùng</div>,
			key: "user",
			width: 250,
			render: (_, record) => (
				<div className="flex items-center gap-3">
					<Avatar
						src={getAvatarUrl(record.avatarUrl)}
						icon={<UserOutlined />}
						size="large"
					/>
					<div>
						<div className="font-semibold">{record.fullName}</div>
						<div className="text-sm text-gray-500">{record.email}</div>
					</div>
				</div>
			),
		},
		{
			title: <div className="text-center">Mã định danh</div>,
			dataIndex: "userIdentifier",
			key: "userIdentifier",
			width: 150,
			render: (id) => id || "-",
		},
		{
			title: <div className="text-center">Số điện thoại</div>,
			dataIndex: "phone",
			key: "phone",
			width: 120,
			render: (phone) => phone || "-",
		},
		{
			title: <div className="text-center">Khoa</div>,
			key: "department",
			width: 150,
			render: (_, record) => record.department?.name || "-",
		},
		{
			title: <div className="text-center">Lop</div>,
			key: "classroom",
			width: 150,
			render: (_, record) => record.classroom?.name || "-",
		},
		{
			title: <div className="text-center">Vai trò</div>,
			key: "role",
			width: 120,
			render: (_, record) => {
				const role = record.role || record.type;
				return (
					<Tag
						color={
							role === "ADMIN" ? "red" : role === "SUB_ADMIN" ? "blue" : role === "STUDENT" ? "gold" : "green"
						}
					>
						{role === "ADMIN"
							? "Quản trị viên"
							: role === "SUB_ADMIN"
							? "Quản trị khoa"
							: role === "STUDENT" ? "Hoc vien" : "Giảng viên"}
					</Tag>
				);
			},
		},
		{
			title: <div className="text-center">Trạng thái</div>,
			dataIndex: "status",
			key: "status",
			width: 120,
			render: (status: string) => {
				const statusConfig: Record<string, { color: string; text: string }> = {
					ACTIVE: { color: "success", text: "Hoạt động" },
					INACTIVE: { color: "default", text: "Không hoạt động" },
					LOCK: { color: "error", text: "Đã khóa" },
				};
				const config = statusConfig[status] || statusConfig.INACTIVE;
				return <Tag color={config.color}>{config.text}</Tag>;
			},
		},
		{
			title: <div className="text-center">Thao tác</div>,
			key: "actions",
			width: 290,
			fixed: "right",
			render: (_, record) => {
				const canDelete = canDeleteUser(record);
				const deleteDisabledReason = getDeleteDisabledReason(record);

				return (
					<Space size="small" wrap>
						<Button
							type="link"
							icon={<EditOutlined />}
							onClick={() => onEdit(record)}
							size="small"
						>
							Sửa
						</Button>
						<Button
							type="link"
							icon={<KeyOutlined />}
							onClick={() => onResetPassword(record)}
							size="small"
						>
							Đặt lại MK
						</Button>
						{deleteDisabledReason ? (
							<Tooltip title={deleteDisabledReason}>
								<Button
									type="link"
									danger
									icon={<DeleteOutlined />}
									onClick={() => onDelete(record)}
									disabled={!canDelete}
									size="small"
								>
									Xóa
								</Button>
							</Tooltip>
						) : (
							<Button
								type="link"
								danger
								icon={<DeleteOutlined />}
								onClick={() => onDelete(record)}
								disabled={!canDelete}
								size="small"
							>
								Xóa
							</Button>
						)}
					</Space>
				);
			},
		},
	];

	return (
		<Table
			columns={columns}
			dataSource={users}
			loading={loading}
			rowKey="id"
			scroll={{ x: 1200 }}
			pagination={{
				showSizeChanger: true,
				showTotal: (total) => `Tổng ${total} người dùng`,
				pageSizeOptions: ["10", "20", "50", "100"],
			}}
		/>
	);
};
