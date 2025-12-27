import { useMemo, useState } from 'react';
import { Tabs, Tag, Card } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { resourceApi } from '@/api/resource.api';
import { ResourceList } from '@/components/modules/resource/ResourceList';
import type { Resource } from '@/types/resource.types';
import { toast } from 'sonner';

interface MyUploadsProps {
	onView?: (resource: Resource) => void;
}

type ApprovalStatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * My Uploads Component - Display resources uploaded by current user with approval status filter
 */
export const MyUploads: React.FC<MyUploadsProps> = ({
	onView,
}) => {
	const [statusFilter, setStatusFilter] = useState<ApprovalStatusFilter>('ALL');

	const {
		data: resources = [],
		isLoading,
	} = useQuery({
		queryKey: ['my-uploads'],
		queryFn: () => resourceApi.getMyUploads(),
		refetchOnMount: 'always', // Always refetch when component mounts to get latest data
	});

	// Filter resources by approval status
	const filteredResources = useMemo(() => {
		if (statusFilter === 'ALL') {
			return resources;
		}
		return resources.filter((resource) => resource.approvalStatus === statusFilter);
	}, [resources, statusFilter]);

	// Count resources by status
	const statusCounts = useMemo(() => {
		return {
			ALL: resources.length,
			PENDING: resources.filter((r) => r.approvalStatus === 'PENDING').length,
			APPROVED: resources.filter((r) => r.approvalStatus === 'APPROVED').length,
			REJECTED: resources.filter((r) => r.approvalStatus === 'REJECTED').length,
		};
	}, [resources]);

	const getStatusTag = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
		switch (status) {
			case 'APPROVED':
				return <Tag color="green" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
			case 'PENDING':
				return <Tag color="orange" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
			case 'REJECTED':
				return <Tag color="red" icon={<CloseCircleOutlined />}>Từ chối</Tag>;
			default:
				return <Tag>{status}</Tag>;
		}
	};

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

	const tabItems = [
		{
			key: 'ALL',
			label: (
				<span>
					<FileTextOutlined className="mr-2" />
					Tất cả ({statusCounts.ALL})
				</span>
			),
		},
		{
			key: 'PENDING',
			label: (
				<span>
					<ClockCircleOutlined className="mr-2" />
					Chờ duyệt ({statusCounts.PENDING})
				</span>
			),
		},
		{
			key: 'APPROVED',
			label: (
				<span>
					<CheckCircleOutlined className="mr-2" />
					Đã duyệt ({statusCounts.APPROVED})
				</span>
			),
		},
		{
			key: 'REJECTED',
			label: (
				<span>
					<CloseCircleOutlined className="mr-2" />
					Từ chối ({statusCounts.REJECTED})
				</span>
			),
		},
	];

	return (
		<div className="space-y-4">
			<Tabs
				activeKey={statusFilter}
				onChange={(key) => setStatusFilter(key as ApprovalStatusFilter)}
				items={tabItems}
				size="large"
			/>

			{filteredResources.length === 0 && !isLoading ? (
				<Card>
					<div className="text-center py-8 text-gray-500">
						{statusFilter === 'ALL' && 'Bạn chưa tải lên học liệu nào'}
						{statusFilter === 'PENDING' && 'Không có học liệu nào đang chờ duyệt'}
						{statusFilter === 'APPROVED' && 'Không có học liệu nào đã được duyệt'}
						{statusFilter === 'REJECTED' && 'Không có học liệu nào bị từ chối'}
					</div>
				</Card>
			) : (
				<ResourceList
					resources={filteredResources}
					loading={isLoading}
					onView={handleView}
					onDownload={handleDownload}
					showUploadButton={true}
				/>
			)}
		</div>
	);
};

