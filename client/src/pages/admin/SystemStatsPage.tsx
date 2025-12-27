import { Card, Row, Col, Tabs } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { TopUploaders } from '@/components/modules/admin/StatsPanel/TopUploaders';
import { TopResources } from '@/components/modules/admin/StatsPanel/TopResources';
import { RecentUploads } from '@/components/modules/admin/StatsPanel/RecentUploads';
import { StorageUsage } from '@/components/modules/admin/StatsPanel/StorageUsage';

/**
 * System Stats Page
 * Trang thống kê chi tiết với các báo cáo
 */
const SystemStatsPage: React.FC = () => {
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
								Danh sách các giảng viên có số lượng tải lên học liệu nhiều nhất trong hệ thống.
							</p>
							<p className="text-sm text-gray-500 mt-2">
								Dữ liệu được cập nhật theo thời gian thực.
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
		{
			key: 'storage',
			label: 'Lưu Trữ',
			children: (
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={12}>
						<StorageUsage />
					</Col>
					<Col xs={24} lg={12}>
						<Card title="Thông tin Lưu trữ">
							<div className="space-y-4">
								<div>
									<h4 className="font-semibold mb-2">Dung lượng tối đa</h4>
									<p className="text-gray-600">
										Hệ thống có giới hạn dung lượng lưu trữ tổng cộng là 100 GB.
									</p>
								</div>
								<div>
									<h4 className="font-semibold mb-2">Cảnh báo</h4>
									<p className="text-gray-600">
										Khi dung lượng sử dụng đạt trên 90%, hệ thống sẽ gửi cảnh báo
										đến quản trị viên.
									</p>
								</div>
								<div>
									<h4 className="font-semibold mb-2">Quản lý</h4>
									<p className="text-gray-600">
										Quản trị viên có thể xóa các học liệu cũ hoặc không còn sử dụng
										để giải phóng dung lượng.
									</p>
								</div>
							</div>
						</Card>
					</Col>
				</Row>
			),
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2">
				<BarChartOutlined className="text-2xl" />
				<h1 className="text-2xl font-bold">Thống Kê Hệ Thống</h1>
			</div>

			<Card>
				<Tabs defaultActiveKey="uploaders" items={tabItems} size="large" />
			</Card>
		</div>
	);
};

export default SystemStatsPage;

