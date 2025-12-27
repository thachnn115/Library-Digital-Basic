import { useState } from 'react';
import { Modal, Button, Alert } from 'antd';
import { ExclamationCircleOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

interface ChangePasswordReminderModalProps {
	open: boolean;
	onCancel?: () => void;
}

/**
 * Modal to remind users to change their password after first login
 * This modal appears when mustChangePassword is true
 */
export const ChangePasswordReminderModal: React.FC<ChangePasswordReminderModalProps> = ({
	open,
	onCancel,
}) => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [loading, setLoading] = useState(false);

	const handleGoToChangePassword = () => {
		setLoading(true);
		// Navigate to profile page where user can change password
		navigate('/profile');
		onCancel?.();
		setLoading(false);
	};

	const handleCancel = () => {
		onCancel?.();
	};

	return (
		<Modal
			open={open}
			title={
				<div className="flex items-center gap-2">
					<ExclamationCircleOutlined className="text-amber-500 text-xl" />
					<span className="text-lg font-semibold">Cần đổi mật khẩu</span>
				</div>
			}
			onCancel={handleCancel}
			footer={[
				<Button key="cancel" onClick={handleCancel}>
					Để sau
				</Button>,
				<Button
					key="change"
					type="primary"
					icon={<LockOutlined />}
					onClick={handleGoToChangePassword}
					loading={loading}
					className="bg-blue-600 hover:bg-blue-700"
				>
					Đổi mật khẩu ngay
				</Button>,
			]}
			closable={true}
			maskClosable={false}
			width={520}
		>
			<div className="space-y-4 py-2">
				<Alert
					message="Tài khoản của bạn cần đổi mật khẩu"
					description={
						<div className="mt-2 space-y-2">
							<p>
								Tài khoản <strong>{user?.email}</strong> đang sử dụng mật khẩu mặc định được cấp.
							</p>
							<p className="text-sm text-gray-600">
								Để bảo mật tài khoản và sử dụng đầy đủ các tính năng của hệ thống, vui lòng đổi mật khẩu ngay.
							</p>
							<p className="text-sm font-semibold text-amber-600 mt-3">
								⚠️ Lưu ý: Bạn sẽ không thể sử dụng đầy đủ các tính năng cho đến khi đổi mật khẩu.
							</p>
						</div>
					}
					type="warning"
					showIcon
					icon={<ExclamationCircleOutlined />}
				/>
			</div>
		</Modal>
	);
};

