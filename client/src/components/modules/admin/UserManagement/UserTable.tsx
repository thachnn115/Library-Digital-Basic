import { Table, Button, Space, Tag, Avatar } from "antd";
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
	onEdit,
	onDelete,
	onResetPassword,
}) => {
	const columns: ColumnsType<User> = [
		{
			title: "Người dùng",
			key: "user",
			width: 250,
			render: (_, record) => (
				<div className="flex items-center gap-3">
					<Avatar src={getAvatarUrl(record.avatarUrl)} icon={<UserOutlined />} size="large" />
					<div>
						<div className="font-semibold">{record.fullName}</div>
						<div className="text-sm text-gray-500">{record.email}</div>
					</div>
				</div>
			),
		},
		{
			title: "Mã định danh",
			dataIndex: "userIdentifier",
			key: "userIdentifier",
			width: 150,
			render: (id) => id || "-",
		},
		{
			title: "Số điện thoại",
			dataIndex: "phone",
			key: "phone",
			width: 120,
			render: (phone) => phone || "-",
		},
		{
			title: "Khoa",
			key: "department",
			width: 150,
			render: (_, record) => record.department?.name || "-",
		},
		{
			title: "Vai trò",
			key: "role",
			width: 120,
			render: (_, record) => {
				const role = record.role || record.type;
				return (
					<Tag
						color={
							role === "ADMIN" ? "red" : role === "SUB_ADMIN" ? "blue" : "green"
						}
					>
						{role === "ADMIN"
							? "Quản trị viên"
							: role === "SUB_ADMIN"
							? "Quản trị khoa"
							: "Giảng viên"}
					</Tag>
				);
			},
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "status",
			width: 120,
			render: (status) => {
				const statusConfig = {
					ACTIVE: { color: "success", text: "Hoạt động" },
					INACTIVE: { color: "default", text: "Không hoạt động" },
					LOCK: { color: "error", text: "Đã khóa" },
				};
				const config = statusConfig[status] || statusConfig.INACTIVE;
				return <Tag color={config.color}>{config.text}</Tag>;
			},
		},
		{
			title: "Thao tác",
			key: "actions",
			width: 200,
			fixed: "right",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						icon={<EditOutlined />}
						onClick={() => onEdit(record)}
					>
						Sửa
					</Button>
					<Button
						type="link"
						icon={<KeyOutlined />}
						onClick={() => onResetPassword(record)}
					>
						Đặt lại MK
					</Button>
					<Button
						type="link"
						danger
						icon={<DeleteOutlined />}
						onClick={() => onDelete(record)}
					>
						Xóa
					</Button>
				</Space>
			),
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
