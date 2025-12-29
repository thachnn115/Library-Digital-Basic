import { useState, useMemo } from 'react';
import { Button, Space, Input, Select, Card } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { UserTable } from '@/components/modules/admin/UserManagement/UserTable';
import { UserCreateModal } from '@/components/modules/admin/UserManagement/UserCreateModal';
import { UserEditModal } from '@/components/modules/admin/UserManagement/UserEditModal';
import { UserResetPasswordModal } from '@/components/modules/admin/UserManagement/UserResetPasswordModal';
import { userApi } from '@/api/user.api';
import { useAuth } from '@/hooks/useAuth';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user.types';

/**
 * Sub-Admin User Management Page
 * Only manages users in the same department
 */
const SubAdminUserManagementPage: React.FC = () => {
	const { user } = useAuth();
	const departmentId = user?.department?.id;

	const [searchKeyword, setSearchKeyword] = useState('');
	const [roleFilter, setRoleFilter] = useState<number | undefined>();
	const [statusFilter, setStatusFilter] = useState<string | undefined>();
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const queryClient = useQueryClient();

	// Debounce search keyword
	const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

	// Fetch users in department only (backend filters by department automatically for SUB_ADMIN)
	const {
		data: usersData,
		isLoading,
	} = useQuery({
		queryKey: ['users', 'department', departmentId],
		queryFn: () =>
			userApi.getAll({
				page: 0,
				size: 1000, // Get all users for frontend filtering
			}),
		enabled: !!departmentId,
	});

	// Filter users on frontend
	const users = useMemo(() => {
		if (!usersData?.content) return [];

		let filtered = usersData.content;

		// Filter by search keyword
		if (debouncedSearchKeyword) {
			const keyword = debouncedSearchKeyword.toLowerCase();
			filtered = filtered.filter(
				(user) =>
					user.fullName?.toLowerCase().includes(keyword) ||
					user.email?.toLowerCase().includes(keyword) ||
					user.userIdentifier?.toLowerCase().includes(keyword) ||
					user.phone?.toLowerCase().includes(keyword)
			);
		}

		// Filter by status
		if (statusFilter) {
			filtered = filtered.filter((user) => user.status === statusFilter);
		}

		return filtered;
	}, [usersData?.content, debouncedSearchKeyword, statusFilter]);

	// Create user mutation (only LECTURER role in same department)
	const createMutation = useMutation({
		mutationFn: (data: CreateUserRequest) => userApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			setCreateModalOpen(false);
			toast.success('Tạo giảng viên thành công!');
		},
		onError: (error: unknown) => {
			let errorMessage = 'Tạo giảng viên thất bại. Vui lòng thử lại.';

			if (error && typeof error === "object" && "response" in error) {
				const axiosError = error as {
					response?: {
						data?: {
							message?: string;
							error?: string;
						};
					};
				};

				const responseData = axiosError.response?.data;
				if (responseData?.message) {
					errorMessage = responseData.message;
					// Check for duplicate entry error
					if (
						errorMessage.includes("Duplicate entry") ||
						errorMessage.includes("user_identifier") ||
						errorMessage.includes("UKiq3l4k8j33ecvygl0wli63yd2")
					) {
						errorMessage =
							"Mã định danh đã tồn tại. Vui lòng sử dụng mã định danh khác.";
					} else if (
						errorMessage.includes("email") &&
						(errorMessage.includes("Duplicate") || errorMessage.includes("unique"))
					) {
						errorMessage = "Email đã tồn tại. Vui lòng sử dụng email khác.";
					}
				} else if (responseData?.error) {
					errorMessage = responseData.error;
				}
			}

			toast.error(errorMessage);
		},
	});

	// Update user mutation
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
			userApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			setEditModalOpen(false);
			setSelectedUser(null);
			toast.success('Cập nhật giảng viên thành công!');
		},
		onError: () => {
			toast.error('Cập nhật giảng viên thất bại. Vui lòng thử lại.');
		},
	});

	// Delete user mutation
	const deleteMutation = useMutation({
		mutationFn: (id: number) => userApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			setDeleteConfirmOpen(false);
			setSelectedUser(null);
			toast.success('Xóa giảng viên thành công!');
		},
		onError: () => {
			toast.error('Xóa giảng viên thất bại. Vui lòng thử lại.');
		},
	});

	// Reset password mutation
	const resetPasswordMutation = useMutation({
		mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
			userApi.resetPassword(id, newPassword),
		onSuccess: () => {
			setResetPasswordModalOpen(false);
			setSelectedUser(null);
			toast.success('Đặt lại mật khẩu thành công!');
		},
		onError: () => {
			toast.error('Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
		},
	});

	const handleCreate = async (data: CreateUserRequest) => {
		// Force department and type for sub-admin (only LECTURER)
		const createData: CreateUserRequest = {
			...data,
			departmentId: typeof departmentId === 'number' ? departmentId : Number(departmentId),
			type: 'LECTURER', // Sub-admin can only create LECTURER
		};
		await createMutation.mutateAsync(createData);
	};

	const handleEdit = (user: User) => {
		setSelectedUser(user);
		setEditModalOpen(true);
	};

	const handleUpdate = async (id: number, data: UpdateUserRequest) => {
		// Ensure department stays the same
		const updateData: UpdateUserRequest = {
			...data,
			departmentId: departmentId,
		};
		await updateMutation.mutateAsync({ id, data: updateData });
	};

	const handleDelete = async (user: User) => {
		if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.fullName}?`)) {
			await deleteMutation.mutateAsync(user.id);
		}
	};

	const handleResetPassword = (user: User) => {
		setSelectedUser(user);
		setResetPasswordModalOpen(true);
	};

	const handleConfirmResetPassword = async (user: User, newPassword: string) => {
		await resetPasswordMutation.mutateAsync({ id: user.id, newPassword });
	};

	const handleClearFilters = () => {
		setSearchKeyword('');
		setRoleFilter(undefined);
		setStatusFilter(undefined);
	};

	if (!departmentId) {
		return <div>Bạn chưa được gán vào khoa nào.</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Quản lý Giảng viên</h1>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => setCreateModalOpen(true)}
				>
					Thêm giảng viên
				</Button>
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
							placeholder="Chọn trạng thái"
							value={statusFilter}
							onChange={setStatusFilter}
							allowClear
							className="w-[150px]"
							options={[
								{ label: 'Hoạt động', value: 'ACTIVE' },
								{ label: 'Không hoạt động', value: 'INACTIVE' },
								{ label: 'Đã khóa', value: 'LOCKED' },
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
					currentUser={user}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onResetPassword={handleResetPassword}
				/>
			</Card>

			<UserCreateModal
				open={createModalOpen}
				onCancel={() => setCreateModalOpen(false)}
				onSubmit={handleCreate}
				currentUserType={user?.type}
			/>

			<UserEditModal
				open={editModalOpen}
				user={selectedUser}
				onCancel={() => {
					setEditModalOpen(false);
					setSelectedUser(null);
				}}
				onSubmit={handleUpdate}
				currentUserType={user?.type}
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

			{/* Delete confirmation modal - reuse from admin page if needed */}
		</div>
	);
};

export default SubAdminUserManagementPage;

