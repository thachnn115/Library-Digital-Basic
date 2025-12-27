import { useState, useEffect } from "react";
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
	Alert,
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
import { classroomApi } from "@/api/classroom.api";
import { specializationApi } from "@/api/specialization.api";
import { cohortApi } from "@/api/cohort.api";
import type {
	Classroom,
	CreateClassroomRequest,
} from "@/types/department.types";

const classroomSchema = z.object({
	name: z.string().min(1, "Tên lớp không được để trống"),
	code: z.string().min(1, "Mã lớp không được để trống"),
	specializationCode: z.string().min(1, "Phải chọn chuyên ngành"),
	cohortCode: z.string().min(1, "Phải chọn khóa"),
	description: z.string().optional(),
});

/**
 * Classroom Manager Component
 */
export const ClassroomManager: React.FC = () => {
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
	const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
		null
	);

	const queryClient = useQueryClient();

	const { data: specializations = [] } = useQuery({
		queryKey: ["specializations"],
		queryFn: () => specializationApi.getAll(),
	});

	const { data: cohorts = [] } = useQuery({
		queryKey: ["cohorts"],
		queryFn: () => cohortApi.getAll(),
	});

	const [filterSpecializationCode, setFilterSpecializationCode] = useState<string>("");
	const [filterCohortCode, setFilterCohortCode] = useState<string>("");

	const { data: classrooms = [], isLoading } = useQuery({
		queryKey: ["classrooms", filterSpecializationCode, filterCohortCode],
		queryFn: () => classroomApi.getAll({
			specializationCode: filterSpecializationCode || undefined,
			cohortCode: filterCohortCode || undefined,
		}),
	});

	const {
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<CreateClassroomRequest>({
		resolver: zodResolver(classroomSchema),
	});

	const selectedSpecializationCode = watch("specializationCode");
	const selectedCohortCode = watch("cohortCode");

	// Get selected specialization and cohort to check their programs
	const selectedSpecialization = specializations.find(
		(s) => s.code === selectedSpecializationCode
	);
	const selectedCohort = cohorts.find((c) => c.code === selectedCohortCode);

	// Filter cohorts by specialization's program
	const availableCohorts = selectedSpecialization?.program?.code
		? cohorts.filter(
				(cohort) =>
					cohort.program?.code === selectedSpecialization.program.code
		  )
		: cohorts;

	// Filter specializations by cohort's program
	const availableSpecializations = selectedCohort?.program?.code
		? specializations.filter(
				(spec) => spec.program?.code === selectedCohort.program.code
		  )
		: specializations;

	// Reset cohort when specialization changes (if programs don't match)
	useEffect(() => {
		if (selectedSpecializationCode && selectedCohortCode) {
			const specProgram = selectedSpecialization?.program?.code;
			const cohortProgram = selectedCohort?.program?.code;
			if (specProgram && cohortProgram && specProgram !== cohortProgram) {
				// Programs don't match, reset cohort
				setValue("cohortCode", "", { shouldValidate: false });
			}
		} else if (selectedSpecializationCode && !selectedCohortCode) {
			// Specialization selected but no cohort - no need to reset
		}
	}, [selectedSpecializationCode, selectedCohortCode, selectedSpecialization, selectedCohort, setValue]);

	// Reset specialization when cohort changes (if programs don't match)
	useEffect(() => {
		if (selectedCohortCode && selectedSpecializationCode) {
			const specProgram = selectedSpecialization?.program?.code;
			const cohortProgram = selectedCohort?.program?.code;
			if (specProgram && cohortProgram && specProgram !== cohortProgram) {
				// Programs don't match, reset specialization
				setValue("specializationCode", "", { shouldValidate: false });
			}
		} else if (selectedCohortCode && !selectedSpecializationCode) {
			// Cohort selected but no specialization - no need to reset
		}
	}, [selectedCohortCode, selectedSpecializationCode, selectedSpecialization, selectedCohort, setValue]);

	const createMutation = useMutation({
		mutationFn: (data: CreateClassroomRequest) => classroomApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["classrooms"] });
			reset();
			message.success("Tạo lớp thành công!");
		},
		onError: () => {
			message.error("Tạo lớp thất bại. Vui lòng thử lại.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: CreateClassroomRequest }) =>
			classroomApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["classrooms"] });
			setEditModalOpen(false);
			setSelectedClassroom(null);
			reset();
			message.success("Cập nhật lớp thành công!");
		},
		onError: () => {
			message.error("Cập nhật lớp thất bại. Vui lòng thử lại.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => classroomApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["classrooms"] });
			setDeleteModalOpen(false);
			setSelectedClassroom(null);
			message.success("Xóa lớp thành công!");
		},
		onError: () => {
			message.error("Xóa lớp thất bại. Vui lòng thử lại.");
		},
	});

	const handleCreate = async (data: CreateClassroomRequest) => {
		await createMutation.mutateAsync(data);
	};

	const handleEdit = async (classroom: Classroom) => {
		setSelectedClassroom(classroom);
		// Fetch latest data before editing
		try {
			const detail = await classroomApi.getById(classroom.id);
			reset({
				name: detail.name,
				code: detail.code,
				specializationCode: detail.specialization?.code || "",
				cohortCode: detail.cohort?.code || "",
				description: detail.description || "",
			});
			setEditModalOpen(true);
		} catch {
			message.error("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
		}
	};

	const handleViewDetail = async (classroom: Classroom) => {
		setSelectedClassroom(classroom);
		setDetailDrawerOpen(true);
	};

	const handleUpdate = async (data: CreateClassroomRequest) => {
		if (selectedClassroom) {
			await updateMutation.mutateAsync({ id: selectedClassroom.id, data });
		}
	};

	const handleDelete = (classroom: Classroom) => {
		setSelectedClassroom(classroom);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (selectedClassroom) {
			await deleteMutation.mutateAsync(selectedClassroom.id);
		}
	};

	const columns: ColumnsType<Classroom> = [
		{
			title: "Mã lớp",
			dataIndex: "code",
			key: "code",
			width: 150,
		},
		{
			title: "Tên lớp",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Khoa",
			key: "department",
			render: (_, record) => record.specialization?.department?.name || "-",
		},
		{
			title: "Chương trình Đào tạo",
			key: "program",
			render: (_, record) => record.specialization?.program?.name || record.specialization?.trainingProgram?.name || "-",
		},
		{
			title: "Chuyên ngành",
			key: "specialization",
			render: (_, record) => record.specialization?.name || "-",
		},
		{
			title: "Khóa",
			key: "cohort",
			render: (_, record) => record.cohort?.code || "-",
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
				<h2 className="text-xl font-semibold">Quản lý Lớp</h2>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						reset();
						setSelectedClassroom(null);
						setEditModalOpen(true);
					}}
				>
					Thêm lớp
				</Button>
			</div>

			{/* Filter Section */}
			<div className="flex gap-4 mb-4">
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
					style={{ width: 250 }}
				/>
				<Select
					placeholder="Lọc theo Khóa"
					value={filterCohortCode || undefined}
					onChange={(value) => setFilterCohortCode(value || "")}
					allowClear
					showSearch
					filterOption={(input, option) =>
						(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
					}
					options={cohorts.map((cohort) => ({
						label: `${cohort.code} - ${cohort.startYear}${cohort.endYear ? `-${cohort.endYear}` : ""}`,
						value: cohort.code,
					}))}
					style={{ width: 250 }}
				/>
			</div>

			<Table
				columns={columns}
				dataSource={classrooms}
				loading={isLoading}
				rowKey="id"
				pagination={{ pageSize: 10 }}
				scroll={{ x: 1000 }}
			/>

			<Modal
				title={selectedClassroom ? "Chỉnh sửa lớp" : "Thêm lớp mới"}
				open={editModalOpen}
				onCancel={() => {
					setEditModalOpen(false);
					setSelectedClassroom(null);
					reset();
				}}
				onOk={handleSubmit(selectedClassroom ? handleUpdate : handleCreate)}
				confirmLoading={isSubmitting}
				width={700}
			>
				<Form layout="vertical">
					<Form.Item
						label="Mã lớp"
						validateStatus={errors.code ? "error" : ""}
						help={errors.code?.message}
					>
						<Controller
							name="code"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập mã lớp" />
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Tên lớp"
						validateStatus={errors.name ? "error" : ""}
						help={errors.name?.message}
					>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập tên lớp" />
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Chuyên ngành"
						validateStatus={errors.specializationCode ? "error" : ""}
						help={errors.specializationCode?.message}
						required
					>
						<Controller
							name="specializationCode"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									placeholder="Chọn chuyên ngành"
									showSearch
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
									options={availableSpecializations.map((spec) => ({
										label: `${spec.code} - ${spec.name}${spec.program ? ` (${spec.program.code})` : ""}`,
										value: spec.code,
									}))}
									notFoundContent={
										availableSpecializations.length === 0 && selectedCohortCode
											? "Không tìm thấy chuyên ngành nào thuộc chương trình đào tạo của khóa đã chọn."
											: "Không tìm thấy"
									}
								/>
							)}
						/>
					</Form.Item>

					{selectedSpecialization && (
						<Alert
							message="Thông tin chuyên ngành đã chọn"
							description={
								<div className="mt-2 space-y-1">
									{selectedSpecialization.department && (
										<p>
											<strong>Khoa:</strong> {selectedSpecialization.department.name} ({selectedSpecialization.department.code})
										</p>
									)}
									{selectedSpecialization.program && (
										<p>
											<strong>Chương trình Đào tạo:</strong> {selectedSpecialization.program.name} ({selectedSpecialization.program.code})
										</p>
									)}
									{selectedCohortCode && selectedCohort && selectedSpecialization.program?.code !== selectedCohort.program?.code && (
										<p className="text-red-600">
											<strong>Cảnh báo:</strong> Khóa đã chọn không thuộc cùng chương trình đào tạo với chuyên ngành này.
										</p>
									)}
								</div>
							}
							type="info"
							showIcon
							className="mb-4"
						/>
					)}

					<Form.Item
						label="Khóa"
						validateStatus={errors.cohortCode ? "error" : ""}
						help={errors.cohortCode?.message}
						required
					>
						<Controller
							name="cohortCode"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									placeholder="Chọn khóa"
									showSearch
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
									options={availableCohorts.map((cohort) => ({
										label: `${cohort.code} - ${cohort.startYear}${
											cohort.endYear ? `-${cohort.endYear}` : ""
										}${cohort.program ? ` (${cohort.program.code})` : ""}`,
										value: cohort.code,
									}))}
									notFoundContent={
										availableCohorts.length === 0 && selectedSpecializationCode
											? "Không tìm thấy khóa nào thuộc chương trình đào tạo của chuyên ngành đã chọn."
											: "Không tìm thấy"
									}
								/>
							)}
						/>
					</Form.Item>

					{selectedCohort && (
						<Alert
							message="Thông tin khóa đã chọn"
							description={
								<div className="mt-2 space-y-1">
									{selectedCohort.program && (
										<p>
											<strong>Chương trình Đào tạo:</strong> {selectedCohort.program.name} ({selectedCohort.program.code})
										</p>
									)}
									<p>
										<strong>Năm:</strong> {selectedCohort.startYear}{selectedCohort.endYear ? ` - ${selectedCohort.endYear}` : ""}
									</p>
									{selectedSpecializationCode && selectedSpecialization && selectedCohort.program?.code !== selectedSpecialization.program?.code && (
										<p className="text-red-600">
											<strong>Cảnh báo:</strong> Chuyên ngành đã chọn không thuộc cùng chương trình đào tạo với khóa này.
										</p>
									)}
								</div>
							}
							type="info"
							showIcon
							className="mb-4"
						/>
					)}

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
					setSelectedClassroom(null);
				}}
				okText="Xóa"
				cancelText="Hủy"
				okButtonProps={{ danger: true }}
				confirmLoading={deleteMutation.isPending}
			>
				<p>
					Bạn có chắc chắn muốn xóa lớp{" "}
					<strong>{selectedClassroom?.name}</strong>?
				</p>
			</Modal>

			<Drawer
				title="Chi tiết Lớp"
				open={detailDrawerOpen}
				onClose={() => {
					setDetailDrawerOpen(false);
					setSelectedClassroom(null);
				}}
				width={600}
			>
				{selectedClassroom && (
					<Descriptions column={1} bordered>
						<Descriptions.Item label="Mã lớp">
							{selectedClassroom.code}
						</Descriptions.Item>
						<Descriptions.Item label="Tên lớp">
							{selectedClassroom.name}
						</Descriptions.Item>
						<Descriptions.Item label="Khoa">
							{selectedClassroom.specialization?.department?.name || "-"} ({selectedClassroom.specialization?.department?.code || "-"})
						</Descriptions.Item>
						<Descriptions.Item label="Chương trình Đào tạo">
							{selectedClassroom.specialization?.program?.name || selectedClassroom.specialization?.trainingProgram?.name || "-"} ({selectedClassroom.specialization?.program?.code || selectedClassroom.specialization?.trainingProgram?.code || "-"})
						</Descriptions.Item>
						<Descriptions.Item label="Chuyên ngành">
							{selectedClassroom.specialization?.name || "-"} ({selectedClassroom.specialization?.code || "-"})
						</Descriptions.Item>
						<Descriptions.Item label="Khóa">
							{selectedClassroom.cohort?.code || "-"} ({selectedClassroom.cohort?.startYear || ""}{selectedClassroom.cohort?.endYear ? `-${selectedClassroom.cohort.endYear}` : ""})
						</Descriptions.Item>
						<Descriptions.Item label="Mô tả">
							{selectedClassroom.description || "-"}
						</Descriptions.Item>
					</Descriptions>
				)}
			</Drawer>
		</div>
	);
};
