import { useState } from "react";
import { Select, Button, Card, Divider } from "antd";
import { ClearOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { trainingProgramApi } from "@/api/training-program.api";
import { specializationApi } from "@/api/specialization.api";
import { cohortApi } from "@/api/cohort.api";
import { classroomApi } from "@/api/classroom.api";
import { userApi } from "@/api/user.api";
import { resourceTypeApi } from "@/api/resource-type.api";
import { useAuthStore } from "@/stores/auth.store";
import type { ResourceSearchParams } from "@/types/resource.types";
import type {
	TrainingProgram,
	Cohort,
	Classroom,
} from "@/types/department.types";
import clsx from "clsx";

const { Option } = Select;

interface ResourceFilterBarProps {
	value?: ResourceSearchParams;
	onChange?: (filters: ResourceSearchParams) => void;
	onClear?: () => void;
	className?: string;
}

/**
 * Resource Filter Bar Component with multiple filter options
 */
export const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
	value,
	onChange,
	onClear,
	className,
}) => {
	const [filters, setFilters] = useState<ResourceSearchParams>(
		() => value || {}
	);
	const { user } = useAuthStore();

	// Fetch filter options - Enabled for all authenticated users
	const { data: allPrograms = [] } = useQuery<TrainingProgram[]>({
		queryKey: ["training-programs"],
		queryFn: () => trainingProgramApi.getAll(),
		enabled: !!user?.id,
		retry: false,
	});

	const { data: allCohorts = [] } = useQuery<Cohort[]>({
		queryKey: ["cohorts"],
		queryFn: () => cohortApi.getAll(),
		enabled: !!user?.id,
		retry: false,
	});

	const { data: specializations = [] } = useQuery({
		queryKey: ["specializations"],
		queryFn: () => specializationApi.getAll(),
		retry: false,
	});

	const { data: allClassrooms = [] } = useQuery<Classroom[]>({
		queryKey: ["classrooms"],
		queryFn: () => classroomApi.getAll(),
		enabled: !!user?.id,
		retry: false,
	});

	// Use data from API for everyone
	const programs = allPrograms;
	const cohorts = allCohorts;
	const classrooms = allClassrooms;

	// Fetch lecturers (only in same department for LECTURER/SUB_ADMIN)
	const { data: lecturersData } = useQuery({
		queryKey: ["lecturers", user?.department?.id],
		queryFn: () => {
			// For LECTURER/SUB_ADMIN: only get lecturers in same department
			// For ADMIN: get all lecturers
			if (user?.type === "ADMIN") {
				return userApi.getAll({ page: 0, size: 1000 });
			} else if (user?.department?.id) {
				return userApi.getAll({
					departmentId:
						typeof user.department.id === "string"
							? parseInt(user.department.id)
							: user.department.id,
					page: 0,
					size: 1000,
				});
			}
			return Promise.resolve({
				content: [],
				totalElements: 0,
				totalPages: 0,
				size: 0,
				number: 0,
				first: true,
				last: true,
				empty: true,
			});
		},
		enabled: !!user?.id,
		retry: false,
	});

	const lecturers = (lecturersData?.content || []).filter(
		(u) => u.type === "LECTURER"
	);

	const { data: resourceTypes = [] } = useQuery({
		queryKey: ["resource-types"],
		queryFn: () => resourceTypeApi.getAll(),
		retry: false,
	});

	// Sync filters when value prop changes (use key prop on parent to reset instead)
	const currentFilters = value !== undefined ? value : filters;

	const handleFilterChange = (
		key: keyof ResourceSearchParams,
		val: string[] | string | undefined
	) => {
		const newFilters = { ...currentFilters, [key]: val };
		setFilters(newFilters);
		onChange?.(newFilters);
	};

	const handleClear = () => {
		const emptyFilters: ResourceSearchParams = {};
		setFilters(emptyFilters);
		onChange?.(emptyFilters);
		onClear?.();
	};

	const hasActiveFilters = Object.values(currentFilters).some(
		(v) =>
			v !== undefined &&
			v !== null &&
			(Array.isArray(v) ? v.length > 0 : v !== "")
	);

	return (
		<Card className={clsx("w-full", className)}>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Bộ lọc nâng cao</h3>
					{hasActiveFilters && (
						<Button
							icon={<ClearOutlined />}
							onClick={handleClear}
							size="small"
							type="link"
						>
							Xóa tất cả
						</Button>
					)}
				</div>

				<Divider className="my-2" />

				{/* Display Department for LECTURER (read-only) */}
				{user?.type === "LECTURER" && user?.department && (
					<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
						<p className="text-sm text-blue-700">
							{user.department.name} ({user.department.code})
						</p>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium mb-2">
							Chương trình đào tạo
						</label>
						<Select
							mode="multiple"
							placeholder="Chọn chương trình đào tạo"
							value={currentFilters.programCode}
							onChange={(val) => handleFilterChange("programCode", val)}
							className="w-full"
							allowClear
							maxTagCount="responsive"
						>
							{programs.map((program) => (
								<Option key={program.id} value={program.code}>
									{program.name}
								</Option>
							))}
						</Select>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">
							Chuyên ngành
						</label>
						<Select
							mode="multiple"
							placeholder="Chọn chuyên ngành"
							value={currentFilters.specializationCode}
							onChange={(val) => handleFilterChange("specializationCode", val)}
							className="w-full"
							allowClear
							maxTagCount="responsive"
						>
							{specializations.map((spec) => (
								<Option key={spec.id} value={spec.code}>
									{spec.name}
								</Option>
							))}
						</Select>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Khóa</label>
						<Select
							mode="multiple"
							placeholder="Chọn khóa"
							value={currentFilters.cohortCode}
							onChange={(val) => handleFilterChange("cohortCode", val)}
							className="w-full"
							allowClear
							maxTagCount="responsive"
						>
							{cohorts.map((cohort) => (
								<Option key={cohort.id} value={cohort.code}>
									{cohort.code}{" "}
									{cohort.startYear && cohort.endYear
										? `(${cohort.startYear}-${cohort.endYear})`
										: cohort.startYear
											? `(${cohort.startYear})`
											: ""}
								</Option>
							))}
						</Select>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Lớp</label>
						<Select
							mode="multiple"
							placeholder="Chọn lớp"
							value={currentFilters.classroomId}
							onChange={(val) => handleFilterChange("classroomId", val)}
							className="w-full"
							allowClear
							maxTagCount="responsive"
						>
							{classrooms
								.filter(
									(classroom): classroom is NonNullable<typeof classroom> =>
										classroom !== undefined && classroom !== null
								)
								.map((classroom) => (
									<Option key={classroom.id} value={classroom.id.toString()}>
										{classroom.name}
									</Option>
								))}
						</Select>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Giảng viên</label>
						<Select
							mode="multiple"
							placeholder="Chọn giảng viên"
							value={currentFilters.lecturerId}
							onChange={(val) => handleFilterChange("lecturerId", val)}
							className="w-full"
							allowClear
							maxTagCount="responsive"
						>
							{lecturers.map((lecturer) => (
								<Option key={lecturer.id} value={lecturer.id.toString()}>
									{lecturer.fullName}
								</Option>
							))}
						</Select>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">
							Loại học liệu
						</label>
						<Select
							mode="multiple"
							placeholder="Chọn loại học liệu"
							value={currentFilters.typeId}
							onChange={(val) => handleFilterChange("typeId", val)}
							className="w-full"
							allowClear
							maxTagCount="responsive"
						>
							{resourceTypes.map((type) => (
								<Option key={type.id} value={type.id.toString()}>
									{type.name}
								</Option>
							))}
						</Select>
					</div>
				</div>
			</div>
		</Card>
	);
};
