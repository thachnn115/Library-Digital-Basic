import { Card, Row, Col, Statistic } from 'antd';
import {
	UserOutlined,
	FileTextOutlined,
	DownloadOutlined,
	DatabaseOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { statsApi } from '@/api/stats.api';
import { TopUploaders } from '@/components/modules/admin/StatsPanel/TopUploaders';
import { TopResources } from '@/components/modules/admin/StatsPanel/TopResources';
import { RecentUploads } from '@/components/modules/admin/StatsPanel/RecentUploads';
import { StorageUsage } from '@/components/modules/admin/StatsPanel/StorageUsage';
import { formatFileSize } from '@/utils/format.utils';

/**
 * Admin Dashboard Page
 * Trang tổng quan với thống kê và bảng điều khiển
 */
const AdminDashboardPage: React.FC = () => {
	// Fetch total users
	const { data: usersData } = useQuery({
		queryKey: ['users', 'total'],
		queryFn: () =>
			userApi.getAll({
				page: 0,
				size: 1,
			}),
	});

	// Fetch recent uploads để lấy tổng số (tạm thời)
	const { data: recentUploads = [] } = useQuery({
		queryKey: ['stats', 'recent-uploads', 100],
		queryFn: () => statsApi.getRecentUploads(100),
	});

	// Fetch storage usage
	const { data: storageUsage = 0 } = useQuery({
		queryKey: ['stats', 'storage-usage'],
		queryFn: () => statsApi.getStorageUsage(),
	});

	const totalUsers = usersData?.totalElements || 0;
	const totalResources = recentUploads.length; // Tạm thời, có thể cải thiện sau

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Tổng quan Hệ thống</h1>

			{/* Overview Cards */}
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="Tổng số người dùng"
							value={totalUsers}
							prefix={<UserOutlined />}
							valueStyle={{ color: '#3f8600' }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="Tổng số học liệu"
							value={totalResources}
							prefix={<FileTextOutlined />}
							valueStyle={{ color: '#1890ff' }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="Dung lượng đã sử dụng"
							value={formatFileSize(storageUsage)}
							prefix={<DatabaseOutlined />}
							valueStyle={{ color: '#cf1322' }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="Uploads gần đây"
							value={recentUploads.length}
							prefix={<DownloadOutlined />}
							valueStyle={{ color: '#722ed1' }}
						/>
					</Card>
				</Col>
			</Row>

			{/* Stats Panels */}
			<Row gutter={[16, 16]}>
				<Col xs={24} lg={12}>
					<TopUploaders limit={5} />
				</Col>
				<Col xs={24} lg={12}>
					<TopResources defaultSort="views" limit={5} />
				</Col>
			</Row>

			<Row gutter={[16, 16]}>
				<Col xs={24} lg={16}>
					<RecentUploads limit={10} />
				</Col>
				<Col xs={24} lg={8}>
					<StorageUsage />
				</Col>
			</Row>
		</div>
	);
};

export default AdminDashboardPage;

