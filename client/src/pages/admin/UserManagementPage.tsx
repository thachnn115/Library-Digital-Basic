import { useState } from "react";
import { Button, Space, Input, Select, Card, Modal } from "antd";
import { PlusOutlined, SearchOutlined, UploadOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserTable } from "@/components/modules/admin/UserManagement/UserTable";
import { UserCreateModal } from "@/components/modules/admin/UserManagement/UserCreateModal";
import { UserEditModal } from "@/components/modules/admin/UserManagement/UserEditModal";
import { UserResetPasswordModal } from "@/components/modules/admin/UserManagement/UserResetPasswordModal";
import { UserImportModal } from "@/components/modules/admin/UserManagement/UserImportModal";
import { userApi } from "@/api/user.api";
import { departmentApi } from "@/api/department.api";
import type {
	User,
	CreateUserRequest,
	UpdateUserRequest,
} from "@/types/user.types";
import type { Department } from "@/types/department.types";

/**
 * Admin User Management Page
 */
const UserManagementPage: React.FC = () => {
	const [searchKeyword, setSearchKeyword] = useState("");
	const [departmentFilter, setDepartmentFilter] = useState<
		number | undefined
	>();
	const [roleFilter, setRoleFilter] = useState<number | undefined>();
	const [statusFilter, setStatusFilter] = useState<string | undefined>();
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

	const queryClient = useQueryClient();

	// Fetch departments for filter
	const { data: departments = [] } = useQuery({
		queryKey: ["departments"],
		queryFn: () => departmentApi.getAll(),
	});

	// Fetch users with filters
	const { data: usersData, isLoading } = useQuery({
		queryKey: [
			"users",
			searchKeyword,
			departmentFilter,
			roleFilter,
			statusFilter,
		],
		queryFn: () =>
			userApi.getAll({
				keyword: searchKeyword || undefined,
				departmentId: departmentFilter,
				roleId: roleFilter,
				status: statusFilter as "ACTIVE" | "INACTIVE" | "LOCKED" | undefined,
				page: 0,
				size: 100,
			}),
	});

	const users = usersData?.content || [];

	// Create user mutation
	const createMutation = useMutation({
		mutationFn: (data: CreateUserRequest) => userApi.create(data),
		onSuccess: () => {
			// Invalidate all user queries to refresh the list
			queryClient.invalidateQueries({
				queryKey: ["users"],
				refetchType: "active",
			});
			setCreateModalOpen(false);
			toast.success("Tạo người dùng thành công!");
		},
		onError: (error: unknown) => {
			let errorMessage = "Tạo người dùng thất bại. Vui lòng thử lại.";

			if (error && typeof error === "object" && "response" in error) {
				const axiosError = error as {
					response?: {
						data?: {
							message?: string;
							error?: string;
						};
						status?: number;
					};
				};

				const responseData = axiosError.response?.data;
				if (responseData?.message) {
					errorMessage = responseData.message;
				} else if (responseData?.error) {
					errorMessage = responseData.error;
				}
			}

			toast.error(errorMessage);
		},
	});

	// Update user mutation
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
			userApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["users"],
				refetchType: "active",
			});
			setEditModalOpen(false);
			setSelectedUser(null);
			toast.success("Cập nhật người dùng thành công!");
		},
		onError: () => {
			toast.error("Cập nhật người dùng thất bại. Vui lòng thử lại.");
		},
	});

	// Delete user mutation
	const deleteMutation = useMutation({
		mutationFn: (id: string) => userApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["users"],
				refetchType: "active",
			});
			setDeleteConfirmOpen(false);
			setSelectedUser(null);
			toast.success("Xóa người dùng thành công!");
		},
		onError: () => {
			toast.error("Xóa người dùng thất bại. Vui lòng thử lại.");
		},
	});

	// Reset password mutation
	const resetPasswordMutation = useMutation({
		mutationFn: (id: string) => userApi.resetPassword(id),
		onSuccess: () => {
			setResetPasswordModalOpen(false);
			setSelectedUser(null);
			toast.success(
				"Đặt lại mật khẩu thành công! Mật khẩu mới đã được gửi qua email."
			);
		},
		onError: () => {
			toast.error("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
		},
	});

	const handleCreate = async (data: CreateUserRequest) => {
		await createMutation.mutateAsync(data);
	};

	const handleEdit = (user: User) => {
		setSelectedUser(user);
		setEditModalOpen(true);
	};

	const handleUpdate = async (id: string, data: UpdateUserRequest) => {
		await updateMutation.mutateAsync({ id, data });
	};

	const handleDelete = (user: User) => {
		setSelectedUser(user);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (selectedUser) {
			await deleteMutation.mutateAsync(selectedUser.id);
		}
	};

	const handleResetPassword = (user: User) => {
		setSelectedUser(user);
		setResetPasswordModalOpen(true);
	};

	const handleConfirmResetPassword = async (user: User) => {
		await resetPasswordMutation.mutateAsync(user.id);
	};

	const handleClearFilters = () => {
		setSearchKeyword("");
		setDepartmentFilter(undefined);
		setRoleFilter(undefined);
		setStatusFilter(undefined);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Quản lý người dùng</h1>
				<Space>
					<Button
						icon={<UploadOutlined />}
						onClick={() => setImportModalOpen(true)}
					>
						Import từ Excel
					</Button>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => setCreateModalOpen(true)}
				>
					Thêm người dùng
				</Button>
				</Space>
			</div>

			<Card>
				<Space direction="vertical" className="w-full" size="middle">
					<div className="flex gap-4 flex-wrap">
						<Input
							placeholder="Tìm kiếm theo tên, email, username..."
							prefix={<SearchOutlined />}
							value={searchKeyword}
							onChange={(e) => setSearchKeyword(e.target.value)}
							className="flex-1 min-w-[250px]"
							allowClear
						/>

						<Select
							placeholder="Chọn khoa"
							value={departmentFilter}
							onChange={setDepartmentFilter}
							allowClear
							className="w-[200px]"
							options={departments.map((dept: Department) => ({
								label: dept.name,
								value: dept.id,
							}))}
						/>

						<Select
							placeholder="Chọn vai trò"
							value={roleFilter}
							onChange={setRoleFilter}
							allowClear
							className="w-[150px]"
							options={[
								{ label: "Quản trị viên", value: 1 },
								{ label: "Quản trị khoa", value: 2 },
								{ label: "Giảng viên", value: 3 },
							]}
						/>

						<Select
							placeholder="Chọn trạng thái"
							value={statusFilter}
							onChange={setStatusFilter}
							allowClear
							className="w-[150px]"
							options={[
								{ label: "Hoạt động", value: "ACTIVE" },
								{ label: "Không hoạt động", value: "INACTIVE" },
								{ label: "Đã khóa", value: "LOCKED" },
							]}
						/>

						<Button onClick={handleClearFilters}>Xóa bộ lọc</Button>
					</div>
				</Space>
			</Card>

			<Card>
				<UserTable
					users={users}
					loading={isLoading}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onResetPassword={handleResetPassword}
				/>
			</Card>

			<UserCreateModal
				open={createModalOpen}
				onCancel={() => setCreateModalOpen(false)}
				onSubmit={handleCreate}
			/>

			<UserEditModal
				open={editModalOpen}
				user={selectedUser}
				onCancel={() => {
					setEditModalOpen(false);
					setSelectedUser(null);
				}}
				onSubmit={handleUpdate}
			/>

			<UserResetPasswordModal
				open={resetPasswordModalOpen}
				user={selectedUser}
				onCancel={() => {
					setResetPasswordModalOpen(false);
					setSelectedUser(null);
				}}
				onConfirm={handleConfirmResetPassword}
			/>

			<UserImportModal
				open={importModalOpen}
				onCancel={() => setImportModalOpen(false)}
				onSuccess={() => {
					// User list will be refreshed automatically via query invalidation
				}}
			/>

			<Modal
				title="Xác nhận xóa"
				open={deleteConfirmOpen}
				onOk={handleConfirmDelete}
				onCancel={() => {
					setDeleteConfirmOpen(false);
					setSelectedUser(null);
				}}
				okText="Xóa"
				cancelText="Hủy"
				okButtonProps={{ danger: true }}
				confirmLoading={deleteMutation.isPending}
			>
				<p>
					Bạn có chắc chắn muốn xóa người dùng{" "}
					<strong>{selectedUser?.fullName}</strong>?
				</p>
				<p className="text-red-500 mt-2">Hành động này không thể hoàn tác.</p>
			</Modal>
		</div>
	);
};

export default UserManagementPage;
