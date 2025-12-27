import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { User } from '@/types/user.types';

interface UserResetPasswordModalProps {
	open: boolean;
	user: User | null;
	onCancel: () => void;
	onConfirm: (user: User) => Promise<void>;
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
	const handleConfirm = async () => {
		if (!user) return;
		try {
			await onConfirm(user);
			message.success('Đặt lại mật khẩu thành công!');
		} catch {
			message.error('Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
		}
	};

	if (!user) return null;

	return (
		<Modal
			title="Đặt lại mật khẩu"
			open={open}
			onCancel={onCancel}
			onOk={handleConfirm}
			okText="Xác nhận"
			cancelText="Hủy"
			okButtonProps={{ danger: true }}
		>
			<div className="flex items-start gap-3">
				<ExclamationCircleOutlined className="text-yellow-500 text-xl mt-1" />
				<div>
					<p className="mb-2">
						Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng:
					</p>
					<p className="font-semibold text-lg">{user.fullName}</p>
					<p className="text-gray-600 text-sm">({user.email})</p>
					<p className="mt-3 text-gray-600">
						Mật khẩu mới sẽ được gửi qua email của người dùng.
					</p>
				</div>
			</div>
		</Modal>
	);
};

