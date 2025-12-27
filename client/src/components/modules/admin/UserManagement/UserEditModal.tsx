import { Modal, Form, Input, Select, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UpdateUserRequest, User } from '@/types/user.types';
import { departmentApi } from '@/api/department.api';
import type { Department } from '@/types/department.types';

const updateUserSchema = z.object({
	email: z.string().email('Email không hợp lệ').optional(),
	fullName: z.string().min(1, 'Họ tên không được để trống').optional(),
	phone: z.string().optional(),
	gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
	userIdentifier: z.string().optional(),
	dateOfBirth: z.string().optional(),
	type: z.enum(['ADMIN', 'SUB_ADMIN', 'LECTURER']).optional(),
	departmentId: z.number().optional(),
	status: z.enum(['ACTIVE', 'INACTIVE', 'LOCK']).optional(),
});

interface UserEditModalProps {
	open: boolean;
	user: User | null;
	onCancel: () => void;
	onSubmit: (id: string, data: UpdateUserRequest) => Promise<void>;
}

/**
 * User Edit Modal Component
 */
export const UserEditModal: React.FC<UserEditModalProps> = ({
	open,
	user,
	onCancel,
	onSubmit,
}) => {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<UpdateUserRequest>({
		resolver: zodResolver(updateUserSchema),
	});

	// Fetch departments
	const { data: departments = [] } = useQuery({
		queryKey: ['departments'],
		queryFn: () => departmentApi.getAll(),
	});

	// Reset form when user changes
	useEffect(() => {
		if (user && open) {
			reset({
				email: user.email,
				fullName: user.fullName,
				phone: user.phone || undefined,
				gender: user.gender || undefined,
				userIdentifier: user.userIdentifier || undefined,
				dateOfBirth: user.dateOfBirth || undefined,
				type: user.type,
				departmentId: typeof user.department?.id === 'number' ? user.department.id : undefined,
				status: user.status,
			});
		} else if (!open) {
			reset();
		}
	}, [user, open, reset]);

	const onFormSubmit = async (data: UpdateUserRequest) => {
		if (!user) return;
		try {
			await onSubmit(user.id, data);
			message.success('Cập nhật người dùng thành công!');
		} catch {
			message.error('Cập nhật người dùng thất bại. Vui lòng thử lại.');
		}
	};

	const typeOptions = [
		{ label: 'Quản trị viên', value: 'ADMIN' },
		{ label: 'Quản trị khoa', value: 'SUB_ADMIN' },
		{ label: 'Giảng viên', value: 'LECTURER' },
	];

	if (!user) return null;

	return (
		<Modal
			title="Chỉnh sửa người dùng"
			open={open}
			onCancel={onCancel}
			onOk={handleSubmit(onFormSubmit)}
			confirmLoading={isSubmitting}
			width={600}
		>
			<Form layout="vertical">
				<Form.Item label="Mã định danh">
					<Input value={user.userIdentifier || '-'} disabled />
				</Form.Item>

				<Form.Item
					label="Email"
					validateStatus={errors.email ? 'error' : ''}
					help={errors.email?.message}
				>
					<Controller
						name="email"
						control={control}
						render={({ field }) => (
							<Input {...field} type="email" placeholder="Nhập email" />
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Họ và tên"
					validateStatus={errors.fullName ? 'error' : ''}
					help={errors.fullName?.message}
				>
					<Controller
						name="fullName"
						control={control}
						render={({ field }) => <Input {...field} placeholder="Nhập họ tên" />}
					/>
				</Form.Item>

				<Form.Item
					label="Số điện thoại"
					validateStatus={errors.phone ? 'error' : ''}
					help={errors.phone?.message}
				>
					<Controller
						name="phone"
						control={control}
						render={({ field }) => (
							<Input {...field} placeholder="Nhập số điện thoại" />
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Giới tính"
					validateStatus={errors.gender ? 'error' : ''}
					help={errors.gender?.message}
				>
					<Controller
						name="gender"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder="Chọn giới tính"
								allowClear
								options={[
									{ label: 'Nam', value: 'MALE' },
									{ label: 'Nữ', value: 'FEMALE' },
									{ label: 'Khác', value: 'OTHER' },
								]}
							/>
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Khoa"
					validateStatus={errors.departmentId ? 'error' : ''}
					help={errors.departmentId?.message}
				>
					<Controller
						name="departmentId"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder="Chọn khoa"
								allowClear
								options={departments.map((dept: Department) => ({
									label: dept.name,
									value: typeof dept.id === 'number' ? dept.id : Number(dept.id),
								}))}
							/>
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Vai trò"
					validateStatus={errors.type ? 'error' : ''}
					help={errors.type?.message}
				>
					<Controller
						name="type"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder="Chọn vai trò"
								options={typeOptions}
							/>
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Trạng thái"
					validateStatus={errors.status ? 'error' : ''}
					help={errors.status?.message}
				>
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder="Chọn trạng thái"
								options={[
									{ label: 'Hoạt động', value: 'ACTIVE' },
									{ label: 'Không hoạt động', value: 'INACTIVE' },
									{ label: 'Đã khóa', value: 'LOCK' },
								]}
							/>
						)}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

