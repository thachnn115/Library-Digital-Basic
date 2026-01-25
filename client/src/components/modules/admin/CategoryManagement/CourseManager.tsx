import { useState, useMemo } from "react";
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
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { courseApi } from "@/api/course.api";
import { departmentApi } from "@/api/department.api";
import type { Course, CreateCourseRequest } from "@/types/department.types";

const courseSchema = z.object({
	code: z.string().min(1, "Mã học phần không được để trống"),
	title: z.string().min(1, "Tên học phần không được để trống"),
	departmentCode: z.string().min(1, "Phải chọn khoa"),
});

/**
 * Course Manager Component
 */
export const CourseManager: React.FC = () => {
	const { user } = useAuth();
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
	const isSubAdmin = user?.type === "SUB_ADMIN";
	const subAdminDeptCode = user?.department?.code;

	const queryClient = useQueryClient();

	// Debounce filter values
	const [filterDepartmentCode, setFilterDepartmentCode] =
		useState<string>("");
	const debouncedFilterDepartmentCode = useDebounce(
		filterDepartmentCode,
		500
	);

	// Fetch courses
	const { data: courses = [], isLoading } = useQuery({
		queryKey: ["courses"],
		queryFn: () => courseApi.getAll(),
	});

	// Get departments
	const { data: departments = [] } = useQuery({
		queryKey: ["departments"],
		queryFn: () => departmentApi.getAll(),
	});

	const departmentOptions = useMemo(() => {
		if (isSubAdmin && subAdminDeptCode) {
			return departments.filter((dept) => dept.code === subAdminDeptCode);
		}
		return departments;
	}, [departments, isSubAdmin, subAdminDeptCode]);

	// Filter courses on frontend
	const filteredCourses = useMemo(() => {
		let filtered = courses;

		// Filter by department
		if (debouncedFilterDepartmentCode) {
			filtered = filtered.filter(
				(course) => course.department?.code === debouncedFilterDepartmentCode
			);
		}

		return filtered;
	}, [courses, debouncedFilterDepartmentCode]);

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
				code: detail.code || "",
				title: detail.title || "",
				departmentCode: detail.department?.code || "",
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
			title: "Mã học phần",
			dataIndex: "code",
			key: "code",
			render: (text) => text || "-",
		},
		{
			title: "Tên học phần",
			dataIndex: "title",
			key: "title",
			render: (text) => text || "-",
		},
		{
			title: "Khoa",
			key: "department",
			render: (_, record) =>
				record.department
					? `${record.department.name} (${record.department.code})`
					: "-",
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
						reset({
							departmentCode: isSubAdmin && subAdminDeptCode ? subAdminDeptCode : "",
						});
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
					placeholder="Lọc theo khoa"
					value={filterDepartmentCode || undefined}
					onChange={(value) => setFilterDepartmentCode(value || "")}
					allowClear
					showSearch
					filterOption={(input, option) =>
						(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
					}
					options={departmentOptions.map((dept) => ({
						label: `${dept.code} - ${dept.name}`,
						value: dept.code,
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
						label="Mã học phần"
						validateStatus={errors.code ? "error" : ""}
						help={errors.code?.message}
						required
					>
						<Controller
							name="code"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập mã học phần" />
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Tên học phần"
						validateStatus={errors.title ? "error" : ""}
						help={errors.title?.message}
						required
					>
						<Controller
							name="title"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập tên học phần" />
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Khoa"
						validateStatus={errors.departmentCode ? "error" : ""}
						help={errors.departmentCode?.message}
						required
					>
						<Controller
							name="departmentCode"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									placeholder="Chọn khoa"
									showSearch
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
									options={departmentOptions.map((dept) => ({
										label: `${dept.code} - ${dept.name}`,
										value: dept.code,
									}))}
									disabled={isSubAdmin}
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
					<strong>{selectedCourse?.title || selectedCourse?.code}</strong>?
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
						<Descriptions.Item label="Mã học phần">
							{selectedCourse.code || "-"}
						</Descriptions.Item>
						<Descriptions.Item label="Tên học phần">
							{selectedCourse.title || "-"}
						</Descriptions.Item>
						<Descriptions.Item label="Khoa">
							{selectedCourse.department
								? `${selectedCourse.department.name} (${selectedCourse.department.code})`
								: "-"}
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
