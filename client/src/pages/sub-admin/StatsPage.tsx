import { Card, Row, Col, Tabs } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { TopUploaders } from '@/components/modules/admin/StatsPanel/TopUploaders';
import { TopResources } from '@/components/modules/admin/StatsPanel/TopResources';
import { RecentUploads } from '@/components/modules/admin/StatsPanel/RecentUploads';
import { useAuth } from '@/hooks/useAuth';

/**
 * Sub-Admin Stats Page
 * Trang thống kê khoa với các báo cáo được lọc theo department
 */
const SubAdminStatsPage: React.FC = () => {
	const { user } = useAuth();
	const departmentName = user?.department?.name || 'Khoa';

	const tabItems = [
		{
			key: 'uploaders',
			label: 'Top Người Tải Lên',
			children: (
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={12}>
						<TopUploaders limit={10} />
					</Col>
					<Col xs={24} lg={12}>
						<Card title="Thông tin">
							<p className="text-gray-600">
								Danh sách các giảng viên trong {departmentName} có số lượng tải lên học liệu nhiều nhất.
							</p>
							<p className="text-sm text-gray-500 mt-2">
								Dữ liệu được cập nhật theo thời gian thực và chỉ hiển thị thống kê của khoa bạn.
							</p>
						</Card>
					</Col>
				</Row>
			),
		},
		{
			key: 'resources',
			label: 'Top Học Liệu',
			children: (
				<Row gutter={[16, 16]}>
					<Col xs={24}>
						<TopResources defaultSort="combined" limit={20} />
					</Col>
				</Row>
			),
		},
		{
			key: 'recent',
			label: 'Uploads Gần Đây',
			children: (
				<Row gutter={[16, 16]}>
					<Col xs={24}>
						<RecentUploads limit={50} />
					</Col>
				</Row>
			),
		},
	];

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="space-y-6">
				<div className="flex items-center gap-2">
					<BarChartOutlined className="text-2xl" />
					<h1 className="text-2xl font-bold">Thống Kê {departmentName}</h1>
				</div>

				<Card>
					<Tabs defaultActiveKey="uploaders" items={tabItems} size="large" />
				</Card>
			</div>
		</div>
	);
};

export default SubAdminStatsPage;

