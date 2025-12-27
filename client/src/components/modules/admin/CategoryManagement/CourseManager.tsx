import { useState } from "react";
import {
	Table,
	Button,
	Space,
	Modal,
	Form,
	Input,
	Select,
	message,
	Descriptions,
	Drawer,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
	EyeOutlined,
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi } from "@/api/course.api";
import { classroomApi } from "@/api/classroom.api";
import { specializationApi } from "@/api/specialization.api";
import { userApi } from "@/api/user.api";
import type { Course, CreateCourseRequest } from "@/types/department.types";

const courseSchema = z.object({
	title: z.string().min(1, "Tiêu đề học phần không được để trống"),
	description: z.string().optional(),
	classroomId: z.string().min(1, "Phải chọn lớp"),
	instructorId: z.string().optional(),
});

/**
 * Course Manager Component
 */
export const CourseManager: React.FC = () => {
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

	const queryClient = useQueryClient();

	const { data: classrooms = [] } = useQuery({
		queryKey: ["classrooms"],
		queryFn: () => classroomApi.getAll(),
	});

	const { data: specializations = [] } = useQuery({
		queryKey: ["specializations"],
		queryFn: () => specializationApi.getAll(),
	});

	// Get lecturers for instructor selection
	const { data: lecturersData } = useQuery({
		queryKey: ["users"],
		queryFn: () => userApi.getAll(),
	});

	// Filter lecturers from all users
	const lecturers =
		lecturersData?.content?.filter((user) => user.type === "LECTURER") || [];

	const [filterClassroomId, setFilterClassroomId] = useState<string>("");
	const [filterSpecializationCode, setFilterSpecializationCode] = useState<string>("");

	const { data: courses = [], isLoading } = useQuery({
		queryKey: ["courses", filterClassroomId, filterSpecializationCode],
		queryFn: () => courseApi.getAll({
			specializationCode: filterSpecializationCode || undefined,
			// Note: Backend doesn't support classroomId filter directly,
			// but we can filter on frontend
		}),
	});

	// Filter by classroom on frontend if needed
	const filteredCourses = filterClassroomId
		? courses.filter((course) => course.classroom?.id?.toString() === filterClassroomId)
		: courses;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateCourseRequest>({
		resolver: zodResolver(courseSchema),
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateCourseRequest) => courseApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			reset();
			message.success("Tạo học phần thành công!");
		},
		onError: () => {
			message.error("Tạo học phần thất bại. Vui lòng thử lại.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string | number;
			data: CreateCourseRequest;
		}) => courseApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			setEditModalOpen(false);
			setSelectedCourse(null);
			reset();
			message.success("Cập nhật học phần thành công!");
		},
		onError: () => {
			message.error("Cập nhật học phần thất bại. Vui lòng thử lại.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string | number) => courseApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			setDeleteModalOpen(false);
			setSelectedCourse(null);
			message.success("Xóa học phần thành công!");
		},
		onError: () => {
			message.error("Xóa học phần thất bại. Vui lòng thử lại.");
		},
	});

	const handleCreate = async (data: CreateCourseRequest) => {
		await createMutation.mutateAsync(data);
	};

	const handleEdit = async (course: Course) => {
		setSelectedCourse(course);
		// Fetch latest data before editing
		try {
			const detail = await courseApi.getById(course.id);
			reset({
				title: detail.title || detail.name || "",
				description: detail.description || "",
				classroomId: detail.classroom?.id?.toString() || "",
				instructorId: detail.instructor?.id?.toString() || "",
			});
			setEditModalOpen(true);
		} catch {
			message.error("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
		}
	};

	const handleViewDetail = async (course: Course) => {
		setSelectedCourse(course);
		setDetailDrawerOpen(true);
	};

	const handleUpdate = async (data: CreateCourseRequest) => {
		if (selectedCourse) {
			await updateMutation.mutateAsync({ id: selectedCourse.id, data });
		}
	};

	const handleDelete = (course: Course) => {
		setSelectedCourse(course);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (selectedCourse) {
			await deleteMutation.mutateAsync(selectedCourse.id);
		}
	};

	const columns: ColumnsType<Course> = [
		{
			title: "Tiêu đề",
			dataIndex: "title",
			key: "title",
			render: (text, record) => text || record.name || record.code || "-",
		},
		{
			title: "Khoa",
			key: "department",
			render: (_, record) => record.classroom?.specialization?.department?.name || "-",
		},
		{
			title: "Chương trình Đào tạo",
			key: "program",
			render: (_, record) => record.classroom?.specialization?.program?.name || record.classroom?.specialization?.trainingProgram?.name || "-",
		},
		{
			title: "Chuyên ngành",
			key: "specialization",
			render: (_, record) => record.classroom?.specialization?.name || "-",
		},
		{
			title: "Khóa",
			key: "cohort",
			render: (_, record) => record.classroom?.cohort?.code || "-",
		},
		{
			title: "Lớp",
			key: "classroom",
			render: (_, record) => record.classroom?.name || "-",
		},
		{
			title: "Giảng viên",
			key: "instructor",
			render: (_, record) => record.instructor?.fullName || "-",
		},
		{
			title: "Mô tả",
			dataIndex: "description",
			key: "description",
			render: (text) => text || "-",
		},
		{
			title: "Thao tác",
			key: "actions",
			width: 150,
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						icon={<EyeOutlined />}
						onClick={() => handleViewDetail(record)}
					>
						Chi tiết
					</Button>
					<Button
						type="link"
						icon={<EditOutlined />}
						onClick={() => handleEdit(record)}
					>
						Sửa
					</Button>
					<Button
						type="link"
						danger
						icon={<DeleteOutlined />}
						onClick={() => handleDelete(record)}
					>
						Xóa
					</Button>
				</Space>
			),
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Quản lý Học phần</h2>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						reset();
						setSelectedCourse(null);
						setEditModalOpen(true);
					}}
				>
					Thêm học phần
				</Button>
			</div>

			{/* Filter Section */}
			<div className="flex gap-4 mb-4">
				<Select
					placeholder="Lọc theo Lớp"
					value={filterClassroomId || undefined}
					onChange={(value) => setFilterClassroomId(value || "")}
					allowClear
					showSearch
					filterOption={(input, option) =>
						(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
					}
					options={classrooms.map((classroom) => ({
						label: `${classroom.code} - ${classroom.name}`,
						value: classroom.id.toString(),
					}))}
					style={{ width: 300 }}
				/>
				<Select
					placeholder="Lọc theo Chuyên ngành"
					value={filterSpecializationCode || undefined}
					onChange={(value) => setFilterSpecializationCode(value || "")}
					allowClear
					showSearch
					filterOption={(input, option) =>
						(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
					}
					options={specializations.map((spec) => ({
						label: `${spec.code} - ${spec.name}`,
						value: spec.code,
					}))}
					style={{ width: 300 }}
				/>
			</div>

			<Table
				columns={columns}
				dataSource={filteredCourses}
				loading={isLoading}
				rowKey="id"
				pagination={{ pageSize: 10 }}
			/>

			<Modal
				title={selectedCourse ? "Chỉnh sửa học phần" : "Thêm học phần mới"}
				open={editModalOpen}
				onCancel={() => {
					setEditModalOpen(false);
					setSelectedCourse(null);
					reset();
				}}
				onOk={handleSubmit(selectedCourse ? handleUpdate : handleCreate)}
				confirmLoading={isSubmitting}
				width={600}
			>
				<Form layout="vertical">
					<Form.Item
						label="Tiêu đề học phần"
						validateStatus={errors.title ? "error" : ""}
						help={errors.title?.message}
						required
					>
						<Controller
							name="title"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập tiêu đề học phần" />
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Lớp"
						validateStatus={errors.classroomId ? "error" : ""}
						help={errors.classroomId?.message}
						required
					>
						<Controller
							name="classroomId"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									placeholder="Chọn lớp"
									showSearch
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
									options={classrooms.map((classroom) => ({
										label: `${classroom.code} - ${classroom.name}`,
										value: classroom.id.toString(),
									}))}
								/>
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Giảng viên"
						validateStatus={errors.instructorId ? "error" : ""}
						help={errors.instructorId?.message}
					>
						<Controller
							name="instructorId"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									placeholder="Chọn giảng viên (tùy chọn)"
									showSearch
									allowClear
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
									options={lecturers.map((lecturer) => ({
										label: `${lecturer.fullName} (${lecturer.email})`,
										value: lecturer.id,
									}))}
								/>
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Mô tả"
						validateStatus={errors.description ? "error" : ""}
						help={errors.description?.message}
					>
						<Controller
							name="description"
							control={control}
							render={({ field }) => (
								<Input.TextArea
									{...field}
									rows={3}
									placeholder="Nhập mô tả (tùy chọn)"
								/>
							)}
						/>
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="Xác nhận xóa"
				open={deleteModalOpen}
				onOk={handleConfirmDelete}
				onCancel={() => {
					setDeleteModalOpen(false);
					setSelectedCourse(null);
				}}
				okText="Xóa"
				cancelText="Hủy"
				okButtonProps={{ danger: true }}
				confirmLoading={deleteMutation.isPending}
			>
				<p>
					Bạn có chắc chắn muốn xóa học phần{" "}
					<strong>{selectedCourse?.title || selectedCourse?.name}</strong>?
				</p>
			</Modal>

			<Drawer
				title="Chi tiết Học phần"
				open={detailDrawerOpen}
				onClose={() => {
					setDetailDrawerOpen(false);
					setSelectedCourse(null);
				}}
				width={600}
			>
				{selectedCourse && (
					<Descriptions column={1} bordered>
						<Descriptions.Item label="Tiêu đề">
							{selectedCourse.title || selectedCourse.name || "-"}
						</Descriptions.Item>
						<Descriptions.Item label="Mô tả">
							{selectedCourse.description || "-"}
						</Descriptions.Item>
						<Descriptions.Item label="Khoa">
							{selectedCourse.classroom?.specialization?.department?.name || "-"} ({selectedCourse.classroom?.specialization?.department?.code || "-"})
						</Descriptions.Item>
						<Descriptions.Item label="Chương trình Đào tạo">
							{selectedCourse.classroom?.specialization?.program?.name || selectedCourse.classroom?.specialization?.trainingProgram?.name || "-"} ({selectedCourse.classroom?.specialization?.program?.code || selectedCourse.classroom?.specialization?.trainingProgram?.code || "-"})
						</Descriptions.Item>
						<Descriptions.Item label="Chuyên ngành">
							{selectedCourse.classroom?.specialization?.name || "-"} ({selectedCourse.classroom?.specialization?.code || "-"})
						</Descriptions.Item>
						<Descriptions.Item label="Khóa">
							{selectedCourse.classroom?.cohort?.code || "-"} ({selectedCourse.classroom?.cohort?.startYear || ""}{selectedCourse.classroom?.cohort?.endYear ? `-${selectedCourse.classroom.cohort.endYear}` : ""})
						</Descriptions.Item>
						<Descriptions.Item label="Lớp">
							{selectedCourse.classroom?.name || "-"} ({selectedCourse.classroom?.code || "-"})
						</Descriptions.Item>
						<Descriptions.Item label="Giảng viên">
							{selectedCourse.instructor?.fullName || "-"} ({selectedCourse.instructor?.email || "-"})
						</Descriptions.Item>
						{selectedCourse.createdAt && (
							<Descriptions.Item label="Ngày tạo">
								{new Date(selectedCourse.createdAt).toLocaleString("vi-VN")}
							</Descriptions.Item>
						)}
						{selectedCourse.updatedAt && (
							<Descriptions.Item label="Ngày cập nhật">
								{new Date(selectedCourse.updatedAt).toLocaleString("vi-VN")}
							</Descriptions.Item>
						)}
					</Descriptions>
				)}
			</Drawer>
		</div>
	);
};
