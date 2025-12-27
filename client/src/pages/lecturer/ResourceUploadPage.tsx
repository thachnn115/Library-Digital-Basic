import { useState } from 'react';
import { Card, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ResourceUploadModal } from '@/components/modules/resource/ResourceUploadModal';

/**
 * Resource Upload Page
 */
const ResourceUploadPage: React.FC = () => {
	const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);

	const handleUploadSuccess = () => {
		message.success('Tải lên học liệu thành công!');
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Tải lên học liệu</h1>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					size="large"
					onClick={() => setUploadModalOpen(true)}
				>
					Tải lên học liệu mới
				</Button>
			</div>

			<Card>
				<div className="text-center py-12">
					<p className="text-gray-600 mb-4">
						Nhấn nút "Tải lên học liệu mới" để bắt đầu tải lên học liệu
					</p>
					<p className="text-sm text-gray-500">
						Hỗ trợ các định dạng: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG,
						PNG, GIF, MP4
					</p>
				</div>
			</Card>

			{/* Upload Modal */}
			<ResourceUploadModal
				open={uploadModalOpen}
				onClose={() => setUploadModalOpen(false)}
				onSuccess={handleUploadSuccess}
			/>
		</div>
	);
};

export default ResourceUploadPage;

