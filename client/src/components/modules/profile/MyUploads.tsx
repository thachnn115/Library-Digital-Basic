import { useMemo } from 'react';
import { Card, Statistic } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { resourceApi } from '@/api/resource.api';
import { ResourceList } from '@/components/modules/resource/ResourceList';
import type { Resource } from '@/types/resource.types';
import { toast } from 'sonner';

interface MyUploadsProps {
	onView?: (resource: Resource) => void;
}

/**
 * My Uploads Component - Display resources uploaded by current user
 * Shows total count of uploaded files
 */
export const MyUploads: React.FC<MyUploadsProps> = ({
	onView,
}) => {
	const {
		data: resources = [],
		isLoading,
	} = useQuery({
		queryKey: ['my-uploads'],
		queryFn: () => resourceApi.getMyUploads(),
		refetchOnMount: 'always', // Always refetch when component mounts to get latest data
	});

	const totalCount = useMemo(() => resources.length, [resources]);

	const handleView = (resource: Resource) => {
		onView?.(resource);
	};

	const handleDownload = async (resource: Resource) => {
		try {
			const blob = await resourceApi.download(resource.id);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${resource.title}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			toast.success('Tải xuống thành công!');
		} catch (error) {
			console.error('Download error:', error);
			toast.error('Tải xuống thất bại. Vui lòng thử lại.');
		}
	};

	return (
		<div className="space-y-4">
			{/* Total count statistic */}
			<Card>
				<Statistic
					title="Tổng số học liệu đã tải lên"
					value={totalCount}
					prefix={<FileTextOutlined />}
					valueStyle={{ color: '#1890ff' }}
				/>
			</Card>

			{/* Resources list */}
			{resources.length === 0 && !isLoading ? (
				<Card>
					<div className="text-center py-8 text-gray-500">
						Bạn chưa tải lên học liệu nào
					</div>
				</Card>
			) : (
				<ResourceList
					resources={resources}
					loading={isLoading}
					onView={handleView}
					onDownload={handleDownload}
					showUploadButton={true}
				/>
			)}
		</div>
	);
};

