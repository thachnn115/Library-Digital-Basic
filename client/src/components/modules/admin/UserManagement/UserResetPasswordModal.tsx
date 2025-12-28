import { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { passwordSchema } from '@/utils/validation.utils';
import type { User } from '@/types/user.types';

const resetPasswordFormSchema = z
	.object({
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Mật khẩu xác nhận không khớp',
		path: ['confirmPassword'],
	});

type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

interface UserResetPasswordModalProps {
	open: boolean;
	user: User | null;
	onCancel: () => void;
	onConfirm: (user: User, newPassword: string) => Promise<void>;
}

/**
 * User Reset Password Modal Component
 */
export const UserResetPasswordModal: React.FC<UserResetPasswordModalProps> = ({
	open,
	user,
	onCancel,
	onConfirm,
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordFormSchema),
		defaultValues: {
			newPassword: '',
			confirmPassword: '',
		},
	});

	const handleConfirm = async (data: ResetPasswordFormData) => {
		if (!user) return;
		setIsSubmitting(true);
		try {
			await onConfirm(user, data.newPassword);
			reset();
			message.success('Đặt lại mật khẩu thành công!');
		} catch {
			message.error('Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		reset();
		onCancel();
	};

	if (!user) return null;

	return (
		<Modal
			title="Đặt lại mật khẩu"
			open={open}
			onCancel={handleCancel}
			onOk={handleSubmit(handleConfirm)}
			okText="Xác nhận"
			cancelText="Hủy"
			okButtonProps={{ danger: true, loading: isSubmitting }}
			width={500}
		>
			<div className="space-y-4">
				<div className="flex items-start gap-3 mb-4">
					<ExclamationCircleOutlined className="text-yellow-500 text-xl mt-1" />
					<div>
						<p className="mb-1">
							Đặt lại mật khẩu cho người dùng:
						</p>
						<p className="font-semibold text-lg">{user.fullName}</p>
						<p className="text-gray-600 text-sm">({user.email})</p>
					</div>
				</div>

				<Form layout="vertical" onFinish={handleSubmit(handleConfirm)}>
					<Form.Item
						label="Mật khẩu mới"
						validateStatus={errors.newPassword ? 'error' : ''}
						help={errors.newPassword?.message}
					>
						<Controller
							name="newPassword"
							control={control}
							render={({ field }) => (
								<Input.Password
									{...field}
									prefix={<LockOutlined />}
									placeholder="Nhập mật khẩu mới"
									size="large"
									disabled={isSubmitting}
								/>
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Xác nhận mật khẩu"
						validateStatus={errors.confirmPassword ? 'error' : ''}
						help={errors.confirmPassword?.message}
					>
						<Controller
							name="confirmPassword"
							control={control}
							render={({ field }) => (
								<Input.Password
									{...field}
									prefix={<LockOutlined />}
									placeholder="Nhập lại mật khẩu mới"
									size="large"
									disabled={isSubmitting}
								/>
							)}
						/>
					</Form.Item>

					<div className="mb-4 p-3 bg-blue-50 rounded-lg">
						<p className="text-sm text-gray-700 mb-2 font-semibold">
							Mật khẩu phải:
						</p>
						<ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
							<li>Có ít nhất 8 ký tự</li>
							<li>Chứa ít nhất 1 chữ hoa</li>
							<li>Chứa ít nhất 1 chữ thường</li>
							<li>Chứa ít nhất 1 chữ số</li>
						</ul>
					</div>
				</Form>
			</div>
		</Modal>
	);
};

