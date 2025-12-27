import { Card } from 'antd';
import { CourseManager } from '@/components/modules/admin/CategoryManagement/CourseManager';
import { useAuth } from '@/hooks/useAuth';

/**
 * Sub-Admin Course Management Page
 * Only manages courses in the same department
 */
const SubAdminCourseManagementPage: React.FC = () => {
	const { user } = useAuth();
	const departmentId = user?.department?.id;

	if (!departmentId) {
		return <div>Bạn chưa được gán vào khoa nào.</div>;
	}

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Quản lý Học phần</h1>
			<Card>
				<CourseManager />
			</Card>
		</div>
	);
};

export default SubAdminCourseManagementPage;

