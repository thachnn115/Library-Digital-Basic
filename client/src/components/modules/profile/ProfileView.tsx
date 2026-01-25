import { useState, useEffect } from "react";
import { Form, Input, Button, Avatar, Modal, Upload, DatePicker } from "antd";
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
import type { UploadProps } from "antd";
import { useLocation } from "react-router-dom";
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

/**
 * Profile View Component - Display and edit user profile
 */
export const ProfileView: React.FC = () => {
	const { user, updateUser, isAdmin, isSubAdmin } = useAuth();
	const queryClient = useQueryClient();
	const location = useLocation();
	const [isEditing, setIsEditing] = useState(false);
	const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
	const [form] = Form.useForm();

	// Auto-open change password modal if navigated from reminder modal
	useEffect(() => {
		const state = location.state as { openChangePassword?: boolean } | null;
		if (state?.openChangePassword) {
			setChangePasswordModalOpen(true);
			// Clear the state to prevent reopening on re-render
			window.history.replaceState({}, document.title);
		}
	}, [location.state]);

	// Check if user can edit all fields (ADMIN/SUB_ADMIN) or only phone/dateOfBirth (LECTURER/STUDENT)
	const canEditAllFields = isAdmin || isSubAdmin;

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
		if (info.file.status === "removed") {
			return;
		}

		const actualFile = info.file.originFileObj || (info.file as unknown as File);

		if (!actualFile || !(actualFile instanceof File)) {
			return;
		}

		if (!actualFile.type || !actualFile.type.startsWith("image/")) {
			toast.error("Chỉ chấp nhận file ảnh!");
			return;
		}

		if (actualFile.size > 5 * 1024 * 1024) {
			toast.error("Kích thước file không được vượt quá 5MB!");
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

			const dateOfBirthStr = values.dateOfBirth
				? (values.dateOfBirth as Dayjs).format("YYYY-MM-DD")
				: undefined;

			const updateData: UpdateUserRequest = canEditAllFields
				? {
					email: values.email,
					fullName: values.fullName,
					phone: values.phoneNumber,
					gender: values.gender,
					dateOfBirth: dateOfBirthStr,
				}
				: {
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
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start page-entrance">
			{/* Left Column: Elite Identity & Status */}
			<div className="lg:col-span-4 space-y-8">
				<div className="premium-card p-10 flex flex-col items-center text-center relative overflow-hidden bg-white">
					{/* Decorative Executive Background */}
					<div className="absolute top-0 left-0 w-full h-32 bg-slate-900 border-b border-slate-800" />
					<div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

					<div className="relative mt-8 mb-8">
						<div className="p-1.5 rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-100 group relative">
							<Avatar
								size={120}
								src={getAvatarUrl(user.avatarUrl)}
								icon={<UserOutlined />}
								className="bg-premium-gradient rounded-[28px] shadow-inner"
							/>
							<Upload
								showUploadList={false}
								beforeUpload={() => false}
								onChange={handleAvatarChange}
								accept="image/*"
								disabled={updateAvatarMutation.isPending}
							>
								<div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center text-white cursor-pointer hover:bg-blue-600 transition-all border-2 border-white group-hover:scale-110">
									<CameraOutlined className="text-lg" />
								</div>
							</Upload>
						</div>
					</div>

					<div className="relative z-10 w-full space-y-2">
						<h2 className="text-2xl font-black text-slate-800 tracking-tight">{user.fullName}</h2>
						<p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">{user.email}</p>

						<div className="pt-4 flex justify-center">
							<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-500/10">
								<span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
								{user.role} Authority
							</div>
						</div>

						<div className="mt-10 pt-10 border-t border-slate-100 flex flex-col gap-4">
							{!isEditing ? (
								<Button
									type="primary"
									icon={<EditOutlined />}
									block
									className="h-14 rounded-2xl flex items-center justify-center gap-3 shadow-blue-500/20"
									onClick={handleEdit}
								>
									Chỉnh sửa hồ sơ
								</Button>
							) : (
								<Button
									danger
									icon={<CloseOutlined />}
									block
									className="h-14 rounded-2xl flex items-center justify-center gap-3 font-bold border-rose-100 text-rose-500 hover:bg-rose-50"
									onClick={handleCancel}
								>
									Hủy thay đổi
								</Button>
							)}
							<Button
								icon={<LockOutlined />}
								block
								className="h-14 rounded-2xl bg-slate-50 border-slate-200 text-slate-600 font-bold hover:text-blue-600 hover:border-blue-600 transition-all flex items-center justify-center gap-3"
								onClick={() => setChangePasswordModalOpen(true)}
							>
								Bảo mật & Mật khẩu
							</Button>
						</div>
					</div>
				</div>

				{/* System Intelligence Block */}
				<div className="premium-card p-8 bg-slate-900 text-white border-0 relative overflow-hidden">
					<div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px]" />
					<div className="relative z-10 space-y-6">
						<div>
							<h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">System Identity Metrics</h4>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-xs font-bold text-slate-500">Global UID</span>
									<code className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">USR-{user.id.toString().slice(-6)}</code>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-xs font-bold text-slate-500">Security Status</span>
									<span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
										<div className="w-1 h-1 rounded-full bg-emerald-400" />
										Optimal
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-xs font-bold text-slate-500">Last Synced</span>
									<span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{dayjs().format('MMM DD, YYYY')}</span>
								</div>
							</div>
						</div>
						<div className="pt-6 border-t border-slate-800">
							<div className="flex gap-2">
								<div className="h-1 flex-1 bg-blue-500 rounded-full" />
								<div className="h-1 flex-1 bg-blue-500 rounded-full" />
								<div className="h-1 flex-1 bg-slate-800 rounded-full" />
							</div>
							<p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profile Completion: 68%</p>
						</div>
					</div>
				</div>
			</div>

			{/* Right Column: High-Density Form */}
			<div className="lg:col-span-8">
				<div className="premium-card p-10 bg-white/60 backdrop-blur-md border-white overflow-visible">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
						<div>
							<h3 className="text-xl font-black text-slate-800 tracking-tight">Thông tin chi tiết</h3>
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Identity & Organizational Data</p>
						</div>
						{isEditing && (
							<Button
								type="primary"
								icon={<SaveOutlined />}
								size="large"
								className="h-14 px-10 rounded-2xl bg-premium-gradient border-0 shadow-xl shadow-blue-500/20 font-black text-xs uppercase tracking-widest"
								onClick={handleSave}
								loading={updateMutation.isPending}
							>
								Save Signature
							</Button>
						)}
					</div>

					<Form
						form={form}
						layout="vertical"
						disabled={!isEditing}
						className="premium-form"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
							<Form.Item
								label={<span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Work Email Address</span>}
								name="email"
							>
								<Input prefix={<MailOutlined className="text-slate-300" />} className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-bold" disabled />
							</Form.Item>

							<Form.Item
								label={<span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Identity Name</span>}
								name="fullName"
								rules={canEditAllFields ? [{ required: true, message: "Bắt buộc!" }] : []}
							>
								<Input
									prefix={<UserOutlined className="text-slate-300" />}
									className="h-14 rounded-2xl border-slate-100 font-bold text-slate-700"
									disabled={!canEditAllFields || !isEditing}
								/>
							</Form.Item>

							<Form.Item
								label={<span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Direct Contact</span>}
								name="phoneNumber"
							>
								<Input
									prefix={<PhoneOutlined className="text-slate-300" />}
									className="h-14 rounded-2xl border-slate-100 font-bold text-slate-700"
									placeholder="No contact provided"
								/>
							</Form.Item>

							<Form.Item
								label={<span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Temporal Origin (DOB)</span>}
								name="dateOfBirth"
							>
								<DatePicker
									className="h-14 rounded-2xl border-slate-100 w-full font-bold"
									format="DD/MM/YYYY"
									placeholder="Select date"
								/>
							</Form.Item>

							<Form.Item
								label={<span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gender Expression</span>}
								name="gender"
							>
								<Input className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-bold" disabled />
							</Form.Item>

							{user.department && (
								<Form.Item
									label={<span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Active Department Hub</span>}
								>
									<Input
										value={user.department.name}
										className="h-14 rounded-2xl bg-blue-500/5 border-blue-500/10 text-blue-700 font-black"
										disabled
									/>
								</Form.Item>
							)}
						</div>
					</Form>
				</div>
			</div>

			{/* Change Password Modal - Executive Style */}
			<Modal
				title={
					<div className="flex flex-col py-2">
						<span className="text-xl font-black text-slate-800 tracking-tight">Security Credentials</span>
						<span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End-to-End Encryption Enabled</span>
					</div>
				}
				open={changePasswordModalOpen}
				onCancel={() => {
					setChangePasswordModalOpen(false);
					resetPassword();
				}}
				onOk={handleSubmitPassword((data) => changePasswordMutation.mutate(data))}
				confirmLoading={isChangingPassword}
				okText="Update Securely"
				cancelText="Postpone"
				className="premium-modal"
				centered
				width={500}
			>
				<div className="py-6 space-y-8">
					<div className="executive-glass p-5 rounded-3xl border-slate-100 bg-blue-50/30 flex gap-4">
						<div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-blue-600 text-xl border border-blue-50">
							<LockOutlined />
						</div>
						<div className="flex-1">
							<h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Stronghold Protocol</h4>
							<p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">
								Ensure your new password uses elite character variations for maximum defense.
							</p>
						</div>
					</div>

					<Form layout="vertical" className="space-y-6">
						<Form.Item
							label={<span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Password</span>}
							validateStatus={passwordErrors.oldPassword ? "error" : ""}
							help={passwordErrors.oldPassword?.message}
						>
							<Controller
								name="oldPassword"
								control={passwordControl}
								render={({ field }) => (
									<Input.Password
										{...field}
										className="h-14 rounded-2xl border-slate-100"
										placeholder="Enter existing password"
										autoComplete="current-password"
									/>
								)}
							/>
						</Form.Item>

						<div className="h-px bg-slate-100 w-full" />

						<Form.Item
							label={<span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Identity Token</span>}
							validateStatus={passwordErrors.newPassword ? "error" : ""}
							help={passwordErrors.newPassword?.message}
						>
							<Controller
								name="newPassword"
								control={passwordControl}
								render={({ field }) => (
									<Input.Password
										{...field}
										className="h-14 rounded-2xl border-slate-100"
										placeholder="Minimum 8 characters"
										autoComplete="new-password"
									/>
								)}
							/>
						</Form.Item>

						<Form.Item
							label={<span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm Identity Token</span>}
							validateStatus={passwordErrors.confirmPassword ? "error" : ""}
							help={passwordErrors.confirmPassword?.message}
						>
							<Controller
								name="confirmPassword"
								control={passwordControl}
								render={({ field }) => (
									<Input.Password
										{...field}
										className="h-14 rounded-2xl border-slate-100"
										placeholder="Verify your entry"
										autoComplete="new-password"
									/>
								)}
							/>
						</Form.Item>
					</Form>
				</div>
			</Modal>
		</div>
	);
};
