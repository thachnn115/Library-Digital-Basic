import { Tabs } from "antd";
import { DepartmentManager } from "@/components/modules/admin/CategoryManagement/DepartmentManager";
import { TrainingProgramManager } from "@/components/modules/admin/CategoryManagement/TrainingProgramManager";
import { SpecializationManager } from "@/components/modules/admin/CategoryManagement/SpecializationManager";
import { CohortManager } from "@/components/modules/admin/CategoryManagement/CohortManager";
import { ClassroomManager } from "@/components/modules/admin/CategoryManagement/ClassroomManager";
import { CourseManager } from "@/components/modules/admin/CategoryManagement/CourseManager";
import { ResourceTypeManager } from "@/components/modules/admin/CategoryManagement/ResourceTypeManager";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Admin Category Management Page
 * Role-based visibility:
 * - ADMIN: All tabs visible
 * - SUB_ADMIN/LECTURER: Only Specialization and Course tabs visible (read-only)
 */
const CategoryManagementPage: React.FC = () => {
	const { user } = useAuthStore();
	const isAdmin = user?.type === "ADMIN";

	const allTabItems = [
		{
			key: "departments",
			label: "Khoa",
			children: <DepartmentManager />,
			adminOnly: true,
		},
		{
			key: "training-programs",
			label: "Chương trình Đào tạo",
			children: <TrainingProgramManager />,
			adminOnly: true,
		},
		{
			key: "specializations",
			label: "Chuyên ngành",
			children: <SpecializationManager />,
			adminOnly: false, // SUB_ADMIN/LECTURER can view (filtered by backend)
		},
		{
			key: "cohorts",
			label: "Khóa",
			children: <CohortManager />,
			adminOnly: true,
		},
		{
			key: "classrooms",
			label: "Lớp",
			children: <ClassroomManager />,
			adminOnly: true,
		},
		{
			key: "courses",
			label: "Học phần",
			children: <CourseManager />,
			adminOnly: false, // SUB_ADMIN/LECTURER can view (filtered by backend)
		},
		{
			key: "resource-types",
			label: "Loại học liệu",
			children: <ResourceTypeManager />,
			adminOnly: false, // PUBLIC access (but only ADMIN can edit)
		},
	];

	// Filter tabs based on role
	const tabItems = allTabItems
		.filter((tab) => isAdmin || !tab.adminOnly)
		.map(({ adminOnly, ...tab }) => tab);

	// Set default active key to first available tab
	const defaultActiveKey = tabItems.length > 0 ? tabItems[0].key : "specializations";

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
			{!isAdmin && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
					<p className="text-sm text-blue-800">
						<strong>Lưu ý:</strong> Bạn chỉ có thể xem các danh mục thuộc phạm vi quyền của mình.
						Chỉ ADMIN mới có thể tạo, sửa và xóa các danh mục.
					</p>
				</div>
			)}
			<Tabs defaultActiveKey={defaultActiveKey} items={tabItems} />
		</div>
	);
};

export default CategoryManagementPage;

