import { useState } from "react";
import { Card, Form, Input, Button, Space, Avatar, Modal, Upload, message, DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import {
	UserOutlined,
	MailOutlined,
	PhoneOutlined,
	EditOutlined,
	SaveOutlined,
	CloseOutlined,
	LockOutlined,
	CameraOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user.api";
import type { UpdateUserRequest } from "@/types/user.types";
import type { ChangePasswordRequest } from "@/types/auth.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/utils/validation.utils";
import { toast } from "sonner";
import { getAvatarUrl } from "@/utils/avatar.utils";
import { isAdmin, isSubAdmin } from "@/utils/auth.utils";

/**
 * Profile View Component - Display and edit user profile
 */
export const ProfileView: React.FC = () => {
	const { user, updateUser } = useAuth();
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
	const [form] = Form.useForm();

	// Check if user can edit all fields (ADMIN/SUB_ADMIN) or only phone/dateOfBirth (LECTURER)
	const canEditAllFields = isAdmin() || isSubAdmin();

	const updateMutation = useMutation({
		mutationFn: (data: UpdateUserRequest) => {
			if (!user?.id) {
				throw new Error("User ID not found");
			}
			return userApi.update(user.id, data);
		},
		onSuccess: (updatedUser) => {
			updateUser({
				email: updatedUser.email,
				fullName: updatedUser.fullName,
				phone: updatedUser.phone,
				gender: updatedUser.gender,
				dateOfBirth: updatedUser.dateOfBirth,
				avatarUrl: updatedUser.avatarUrl,
			});
			toast.success("Cập nhật thông tin thành công!");
			setIsEditing(false);
		},
		onError: (error) => {
			console.error("Update error:", error);
			toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại.");
		},
	});

	const {
		control: passwordControl,
		handleSubmit: handleSubmitPassword,
		reset: resetPassword,
		formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
	} = useForm<ChangePasswordRequest>({
		resolver: zodResolver(changePasswordSchema),
	});

	const changePasswordMutation = useMutation({
		mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data),
		onSuccess: () => {
			// Update mustChangePassword to false after successful password change
			updateUser({ mustChangePassword: false });
			toast.success("Đổi mật khẩu thành công!");
			setChangePasswordModalOpen(false);
			resetPassword();
		},
		onError: (error) => {
			console.error("Change password error:", error);
			toast.error("Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.");
		},
	});

	const updateAvatarMutation = useMutation({
		mutationFn: (file: File) => {
			if (!user?.id) {
				throw new Error("User ID not found");
			}
			return userApi.updateAvatar(user.id, file);
		},
		onSuccess: (updatedUser) => {
			updateUser({
				avatarUrl: updatedUser.avatarUrl,
			});
			queryClient.invalidateQueries({ queryKey: ["user", "me"] });
			toast.success("Cập nhật avatar thành công!");
		},
		onError: (error: unknown) => {
			console.error("Update avatar error:", error);
			let errorMessage = "Cập nhật avatar thất bại. Vui lòng thử lại.";
			
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as { 
					response?: { 
						data?: { 
							message?: string;
							error?: string;
						};
						status?: number;
					} 
				};
				
				const responseData = axiosError.response?.data;
				if (responseData?.message) {
					errorMessage = responseData.message;
				} else if (responseData?.error) {
					errorMessage = responseData.error;
				} else if (axiosError.response?.status === 413) {
					errorMessage = "File quá lớn. Vui lòng chọn file nhỏ hơn.";
				} else if (axiosError.response?.status === 400) {
					errorMessage = "File không hợp lệ. Vui lòng chọn file ảnh.";
				}
			}
			
			toast.error(errorMessage);
		},
	});

	const handleAvatarChange: UploadProps["onChange"] = (info) => {
		// Handle file removal
		if (info.file.status === "removed") {
			return;
		}

		// Get the actual file object
		// When beforeUpload returns false, file is available in originFileObj
		const actualFile = info.file.originFileObj || (info.file as unknown as File);
		
		if (!actualFile || !(actualFile instanceof File)) {
			return;
		}

		// Validate file type
		if (!actualFile.type || !actualFile.type.startsWith("image/")) {
			message.error("Chỉ chấp nhận file ảnh!");
			return;
		}

		// Validate file size (max 5MB)
		if (actualFile.size > 5 * 1024 * 1024) {
			message.error("Kích thước file không được vượt quá 5MB!");
			return;
		}

		updateAvatarMutation.mutate(actualFile);
	};

	const handleEdit = () => {
		if (user) {
			form.setFieldsValue({
				email: user.email,
				fullName: user.fullName,
				phoneNumber: user.phone,
				gender: user.gender,
				dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : undefined,
			});
			setIsEditing(true);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		setIsEditing(false);
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			
			// Convert dateOfBirth from Dayjs to string format (YYYY-MM-DD)
			const dateOfBirthStr = values.dateOfBirth 
				? (values.dateOfBirth as Dayjs).format("YYYY-MM-DD")
				: undefined;
			
			// If user is LECTURER (not ADMIN/SUB_ADMIN), only send phone and dateOfBirth
			const updateData: UpdateUserRequest = canEditAllFields
				? {
						email: values.email,
						fullName: values.fullName,
						phone: values.phoneNumber,
						gender: values.gender,
						dateOfBirth: dateOfBirthStr,
					}
				: {
						// LECTURER can only update phone and dateOfBirth
						phone: values.phoneNumber,
						dateOfBirth: dateOfBirthStr,
					};
			
			updateMutation.mutate(updateData);
		} catch (error) {
			console.error("Validation error:", error);
		}
	};

	if (!user) {
		return (
			<Card>
				<p className="text-gray-500">Không tìm thấy thông tin người dùng</p>
			</Card>
		);
	}

	return (
		<Card>
			<div className="space-y-6">
				{/* Avatar Section */}
				<div className="flex items-center gap-4 pb-6 border-b">
					<div className="relative">
						<Avatar
							size={80}
							src={getAvatarUrl(user.avatarUrl)}
							icon={<UserOutlined />}
							className="bg-blue-500"
						/>
						{/* Only ADMIN and SUB_ADMIN can upload avatar */}
						{canEditAllFields && (
							<Upload
								showUploadList={false}
								beforeUpload={() => false}
								onChange={handleAvatarChange}
								accept="image/*"
								disabled={updateAvatarMutation.isPending}
							>
								<Button
									type="primary"
									shape="circle"
									icon={<CameraOutlined />}
									size="small"
									className="absolute bottom-0 right-0"
									loading={updateAvatarMutation.isPending}
								/>
							</Upload>
						)}
					</div>
					<div className="flex-1">
						<h2 className="text-2xl font-bold mb-1">{user.fullName}</h2>
						<p className="text-gray-600">{user.email}</p>
						{user.role && (
							<div className="mt-2">
								<span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm mr-2">
									{user.role === "ADMIN"
										? "Quản trị viên"
										: user.role === "SUB_ADMIN"
										? "Quản trị viên phụ"
										: "Giảng viên"}
								</span>
							</div>
						)}
					</div>
					{!isEditing && (
						<Space>
							<Button
								icon={<LockOutlined />}
								onClick={() => setChangePasswordModalOpen(true)}
							>
								Đổi mật khẩu
							</Button>
							<Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
								Chỉnh sửa
							</Button>
						</Space>
					)}
				</div>

				{/* Profile Form */}
				<Form
					form={form}
					layout="vertical"
					disabled={!isEditing}
					initialValues={{
						email: user.email,
						fullName: user.fullName,
						phoneNumber: user.phone,
						gender: user.gender,
						dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : undefined,
					}}
				>
					<Form.Item
						label="Email"
						name="email"
						rules={[
							{ required: true, message: "Vui lòng nhập email" },
							{ type: "email", message: "Email không hợp lệ" },
						]}
					>
						<Input prefix={<MailOutlined />} placeholder="Email" disabled />
					</Form.Item>

					<Form.Item
						label="Họ và tên"
						name="fullName"
						rules={canEditAllFields ? [{ required: true, message: "Vui lòng nhập họ và tên" }] : []}
					>
						<Input 
							prefix={<UserOutlined />} 
							placeholder="Họ và tên" 
							disabled={!canEditAllFields || !isEditing}
						/>
					</Form.Item>

					<Form.Item label="Số điện thoại" name="phoneNumber">
						<Input 
							prefix={<PhoneOutlined />} 
							placeholder="Số điện thoại" 
							disabled={!isEditing}
						/>
					</Form.Item>

					<Form.Item label="Ngày sinh" name="dateOfBirth">
						<DatePicker 
							style={{ width: "100%" }}
							placeholder="Chọn ngày sinh"
							disabled={!isEditing}
							format="DD/MM/YYYY"
						/>
					</Form.Item>

					<Form.Item label="Giới tính" name="gender">
						<Input prefix={<UserOutlined />} placeholder="Giới tính" disabled />
					</Form.Item>

					{user.department && (
						<Form.Item label="Khoa">
							<Input value={user.department.name} disabled />
						</Form.Item>
					)}

					{isEditing && (
						<Form.Item>
							<Space>
								<Button
									type="primary"
									icon={<SaveOutlined />}
									onClick={handleSave}
									loading={updateMutation.isPending}
								>
									Lưu thay đổi
								</Button>
								<Button icon={<CloseOutlined />} onClick={handleCancel}>
									Hủy
								</Button>
							</Space>
						</Form.Item>
					)}
				</Form>
			</div>

			{/* Change Password Modal */}
			<Modal
				title="Đổi mật khẩu"
				open={changePasswordModalOpen}
				onCancel={() => {
					setChangePasswordModalOpen(false);
					resetPassword();
				}}
				onOk={handleSubmitPassword((data) => changePasswordMutation.mutate(data))}
				confirmLoading={isChangingPassword}
				okText="Đổi mật khẩu"
				cancelText="Hủy"
			>
				<Form layout="vertical">
					<Form.Item
						label="Mật khẩu cũ"
						validateStatus={passwordErrors.oldPassword ? "error" : ""}
						help={passwordErrors.oldPassword?.message}
						required
					>
						<Controller
							name="oldPassword"
							control={passwordControl}
							render={({ field }) => (
								<Input.Password
									{...field}
									prefix={<LockOutlined />}
									placeholder="Nhập mật khẩu cũ"
									autoComplete="current-password"
								/>
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Mật khẩu mới"
						validateStatus={passwordErrors.newPassword ? "error" : ""}
						help={passwordErrors.newPassword?.message}
						required
					>
						<Controller
							name="newPassword"
							control={passwordControl}
							render={({ field }) => (
								<Input.Password
									{...field}
									prefix={<LockOutlined />}
									placeholder="Nhập mật khẩu mới"
									autoComplete="new-password"
								/>
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Xác nhận mật khẩu mới"
						validateStatus={passwordErrors.confirmPassword ? "error" : ""}
						help={passwordErrors.confirmPassword?.message}
						required
					>
						<Controller
							name="confirmPassword"
							control={passwordControl}
							render={({ field }) => (
								<Input.Password
									{...field}
									prefix={<LockOutlined />}
									placeholder="Nhập lại mật khẩu mới"
									autoComplete="new-password"
								/>
							)}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};
