import { Modal, Form, Input, Select, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UpdateUserRequest, User } from '@/types/user.types';
import { departmentApi } from '@/api/department.api';
import { classroomApi } from '@/api/classroom.api';
import type { Department, Classroom } from '@/types/department.types';

const updateUserSchema = z.object({
	email: z.string().email('Email không hợp lệ').optional(),
	fullName: z.string().min(1, 'Họ tên không được để trống').optional(),
	phone: z.string().optional(),
	address: z.string().optional(),
	gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
	userIdentifier: z.string().optional(),
	dateOfBirth: z.string().optional(),
	type: z.enum(['ADMIN', 'SUB_ADMIN', 'LECTURER', 'STUDENT']).optional(),
	departmentId: z.number().optional(),
	classroomId: z.string().optional(),
	status: z.enum(['ACTIVE', 'INACTIVE', 'LOCK']).optional(),
})
	.refine(
		(data) => {
			if (data.type === "STUDENT") {
				return !!data.classroomId && data.classroomId.trim().length > 0;
			}
			return true;
		},
		{
			message: "Classroom is required for STUDENT",
			path: ["classroomId"],
		}
	);

interface UserEditModalProps {
	open: boolean;
	user: User | null;
	onCancel: () => void;
	onSubmit: (id: string, data: UpdateUserRequest) => Promise<void>;
	currentUserType?: "ADMIN" | "SUB_ADMIN" | "LECTURER" | "STUDENT";
}

/**
 * User Edit Modal Component
 */
export const UserEditModal: React.FC<UserEditModalProps> = ({
	open,
	user,
	onCancel,
	onSubmit,
	currentUserType,
}) => {
	const isSubAdmin = currentUserType === "SUB_ADMIN";
	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<UpdateUserRequest>({
		resolver: zodResolver(updateUserSchema),
	});

	const selectedType = watch("type");

	// Fetch departments
	const { data: departments = [] } = useQuery({
		queryKey: ['departments'],
		queryFn: () => departmentApi.getAll(),
	});

	const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery({
		queryKey: ["classrooms"],
		queryFn: () => classroomApi.getAll(),
		enabled: selectedType === "STUDENT",
	});

	// Reset form when user changes
	useEffect(() => {
		if (user && open) {
			reset({
				email: user.email,
				fullName: user.fullName,
				phone: user.phone || undefined,
				address: user.address || undefined,
				gender: user.gender || undefined,
				userIdentifier: user.userIdentifier || undefined,
				dateOfBirth: user.dateOfBirth || undefined,
				type: user.type,
				departmentId: typeof user.department?.id === 'number' ? user.department.id : undefined,
				classroomId: user.classroom?.id ? String(user.classroom.id) : undefined,
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

	// Filter type options based on current user type
	const typeOptions = isSubAdmin
		? [
				// SUB_ADMIN can change to SUB_ADMIN or LECTURER, but not ADMIN
				{ label: 'Quản trị khoa', value: 'SUB_ADMIN' },
				{ label: 'Giảng viên', value: 'LECTURER' },
		  ]
		: [
				// ADMIN can change to any type
				{ label: 'Quản trị viên', value: 'ADMIN' },
				{ label: 'Quản trị khoa', value: 'SUB_ADMIN' },
				{ label: 'Giảng viên', value: 'LECTURER' },
				{ label: 'Hoc vien', value: 'STUDENT' },
	];

	if (!user) return null;

	const classroomOptions = classrooms.map((classroom: Classroom) => ({
		label: `${classroom.name} (${classroom.code})`,
		value: String(classroom.id),
	}));
	const currentClassroomId = user.classroom?.id ? String(user.classroom.id) : null;
	if (
		currentClassroomId &&
		!classroomOptions.some((option) => option.value === currentClassroomId)
	) {
		classroomOptions.unshift({
			label: user.classroom?.code || currentClassroomId,
			value: currentClassroomId,
		});
	}

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
					label="Dia chi"
					validateStatus={errors.address ? "error" : ""}
					help={errors.address?.message}
				>
					<Controller
						name="address"
						control={control}
						render={({ field }) => (
							<Input {...field} placeholder="Nhap dia chi" />
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
				{(selectedType === "SUB_ADMIN" || selectedType === "LECTURER") && (
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
									placeholder="Chon khoa"
									allowClear
									options={departments.map((dept: Department) => ({
										label: dept.name,
										value: typeof dept.id === 'number' ? dept.id : Number(dept.id),
									}))}
								/>
							)}
						/>
					</Form.Item>
				)}
				{selectedType === "STUDENT" && (
					<Form.Item
						label="Lop"
						validateStatus={errors.classroomId ? "error" : ""}
						help={errors.classroomId?.message}
						required
					>
						<Controller
							name="classroomId"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									placeholder={
										isLoadingClassrooms
											? "Dang tai..."
											: classrooms.length === 0
											? "Khong co lop"
											: "Chon lop"
									}
									loading={isLoadingClassrooms}
									disabled={isLoadingClassrooms}
									options={classroomOptions}
									notFoundContent={
										classrooms.length === 0 ? "Khong co lop" : "Khong tim thay"
									}
								/>
							)}
						/>
					</Form.Item>
				)}

				<Form.Item
					label="Vai trò"
					validateStatus={errors.type ? 'error' : ''}
					help={errors.type?.message || (isSubAdmin && "SUB_ADMIN không thể thay đổi vai trò thành Quản trị viên")}
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

