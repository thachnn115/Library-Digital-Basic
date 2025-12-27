import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { courseApi } from '@/api/course.api';
import { useAuth } from '@/hooks/useAuth';

/**
 * Sub-Admin Dashboard Page
 */
const SubAdminDashboardPage: React.FC = () => {
	const { user } = useAuth();
	const departmentId = user?.department?.id;

	// Fetch users in department
	const { data: usersData } = useQuery({
		queryKey: ['users', 'department', departmentId],
		queryFn: () =>
			userApi.getAll({
				departmentId,
				page: 0,
				size: 1,
			}),
		enabled: !!departmentId,
	});

	// Fetch courses in department
	const { data: courses = [] } = useQuery({
		queryKey: ['courses', 'department', departmentId],
		queryFn: () => courseApi.getAll(departmentId),
		enabled: !!departmentId,
	});

	const totalUsers = usersData?.totalElements || 0;
	const totalCourses = courses.length;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Tổng quan Khoa</h1>

			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} lg={8}>
					<Card>
						<Statistic
							title="Tổng số giảng viên"
							value={totalUsers}
							prefix={<UserOutlined />}
							valueStyle={{ color: '#3f8600' }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={8}>
					<Card>
						<Statistic
							title="Tổng số học phần"
							value={totalCourses}
							prefix={<BookOutlined />}
							valueStyle={{ color: '#1890ff' }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={8}>
					<Card>
						<Statistic
							title="Học liệu đã tải lên"
							value={0}
							prefix={<FileTextOutlined />}
							valueStyle={{ color: '#cf1322' }}
						/>
					</Card>
				</Col>
			</Row>

			<Card title="Thông tin khoa">
				<div className="space-y-2">
					<p>
						<strong>Tên khoa:</strong> {user?.department?.name || '-'}
					</p>
					<p>
						<strong>Mã khoa:</strong> {user?.department?.code || '-'}
					</p>
				</div>
			</Card>
		</div>
	);
};

export default SubAdminDashboardPage;

