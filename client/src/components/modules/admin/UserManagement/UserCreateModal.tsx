import { Modal, Form, Input, Select, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CreateUserRequest } from "@/types/user.types";
import { departmentApi } from "@/api/department.api";
import type { Department } from "@/types/department.types";

const createUserSchema = z
	.object({
		email: z.string().email("Email không hợp lệ"),
		password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
		fullName: z.string().min(1, "Họ tên không được để trống").optional(),
		phone: z.string().optional(),
		gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
		userIdentifier: z.string().optional(),
		dateOfBirth: z.string().optional(),
		type: z.enum(["ADMIN", "SUB_ADMIN", "LECTURER"]),
		status: z.enum(["ACTIVE", "INACTIVE", "LOCK"]).optional(),
		departmentId: z.number().optional(),
	})
	.refine(
		(data) => {
			// SUB_ADMIN và LECTURER bắt buộc phải có departmentId
			if (data.type === "SUB_ADMIN" || data.type === "LECTURER") {
				return data.departmentId !== undefined && data.departmentId !== null;
			}
			return true;
		},
		{
			message: "Khoa là bắt buộc cho Quản trị khoa và Giảng viên",
			path: ["departmentId"],
		}
	);

interface UserCreateModalProps {
	open: boolean;
	onCancel: () => void;
	onSubmit: (data: CreateUserRequest) => Promise<void>;
}

/**
 * User Create Modal Component
 */
export const UserCreateModal: React.FC<UserCreateModalProps> = ({
	open,
	onCancel,
	onSubmit,
}) => {
	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<CreateUserRequest>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			status: "ACTIVE",
		},
	});

	const selectedType = watch("type");

	// Fetch departments
	const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
		queryKey: ["departments"],
		queryFn: () => departmentApi.getAll(),
	});

	// Reset form when modal closes
	useEffect(() => {
		if (!open) {
			reset();
		}
	}, [open, reset]);

	const onFormSubmit = async (data: CreateUserRequest) => {
		try {
			await onSubmit(data);
			reset();
			message.success("Tạo người dùng thành công!");
		} catch (error) {
			// Error is already handled by mutation onError
			console.error("Create user error:", error);
		}
	};

	const typeOptions = [
		{ label: "Quản trị viên", value: "ADMIN" },
		{ label: "Quản trị khoa", value: "SUB_ADMIN" },
		{ label: "Giảng viên", value: "LECTURER" },
	];

	return (
		<Modal
			title="Tạo người dùng mới"
			open={open}
			onCancel={onCancel}
			onOk={handleSubmit(onFormSubmit)}
			confirmLoading={isSubmitting}
			width={600}
		>
			<Form layout="vertical">
				<Form.Item
					label="Email"
					validateStatus={errors.email ? "error" : ""}
					help={errors.email?.message}
					required
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
					label="Mật khẩu"
					validateStatus={errors.password ? "error" : ""}
					help={errors.password?.message}
					required
				>
					<Controller
						name="password"
						control={control}
						render={({ field }) => (
							<Input.Password
								{...field}
								placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
								autoComplete="new-password"
							/>
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Họ và tên"
					validateStatus={errors.fullName ? "error" : ""}
					help={errors.fullName?.message}
				>
					<Controller
						name="fullName"
						control={control}
						render={({ field }) => (
							<Input {...field} placeholder="Nhập họ tên" />
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Số điện thoại"
					validateStatus={errors.phone ? "error" : ""}
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
					label="Mã định danh"
					validateStatus={errors.userIdentifier ? "error" : ""}
					help={errors.userIdentifier?.message}
				>
					<Controller
						name="userIdentifier"
						control={control}
						render={({ field }) => (
							<Input {...field} placeholder="Nhập mã định danh (tùy chọn)" />
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Ngày sinh"
					validateStatus={errors.dateOfBirth ? "error" : ""}
					help={errors.dateOfBirth?.message}
				>
					<Controller
						name="dateOfBirth"
						control={control}
						render={({ field }) => (
							<Input {...field} type="date" placeholder="Chọn ngày sinh" />
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Giới tính"
					validateStatus={errors.gender ? "error" : ""}
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
									{ label: "Nam", value: "MALE" },
									{ label: "Nữ", value: "FEMALE" },
									{ label: "Khác", value: "OTHER" },
								]}
							/>
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Khoa"
					validateStatus={errors.departmentId ? "error" : ""}
					help={
						errors.departmentId?.message ||
						(departments.length === 0 &&
							(selectedType === "SUB_ADMIN" || selectedType === "LECTURER") &&
							"Chưa có khoa nào trong hệ thống. Vui lòng tạo khoa trước.")
					}
					required={selectedType === "SUB_ADMIN" || selectedType === "LECTURER"}
				>
					<Controller
						name="departmentId"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder={
									isLoadingDepartments
										? "Đang tải..."
										: departments.length === 0
										? "Chưa có khoa nào"
										: "Chọn khoa"
								}
								loading={isLoadingDepartments}
								disabled={departments.length === 0 || isLoadingDepartments}
								allowClear={
									selectedType !== "SUB_ADMIN" && selectedType !== "LECTURER"
								}
								options={departments.map((dept: Department) => ({
									label: `${dept.name} (${dept.code})`,
									value:
										typeof dept.id === "number" ? dept.id : Number(dept.id),
								}))}
								notFoundContent={
									departments.length === 0
										? "Chưa có khoa nào trong hệ thống"
										: "Không tìm thấy"
								}
							/>
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Vai trò"
					validateStatus={errors.type ? "error" : ""}
					help={errors.type?.message}
					required
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
					validateStatus={errors.status ? "error" : ""}
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
									{ label: "Hoạt động", value: "ACTIVE" },
									{ label: "Không hoạt động", value: "INACTIVE" },
									{ label: "Đã khóa", value: "LOCK" },
								]}
							/>
						)}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};
