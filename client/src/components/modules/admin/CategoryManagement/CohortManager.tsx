import { useState } from "react";
import {
	Table,
	Button,
	Space,
	Modal,
	Form,
	Input,
	InputNumber,
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
import { cohortApi } from "@/api/cohort.api";
import { trainingProgramApi } from "@/api/training-program.api";
import type { Cohort, CreateCohortRequest } from "@/types/department.types";

const cohortSchema = z.object({
	code: z.string().min(1, "Mã khóa không được để trống"),
	programCode: z.string().min(1, "Phải chọn chương trình đào tạo"),
	startYear: z.number().min(2000, "Năm bắt đầu phải >= 2000"),
	endYear: z.number().min(2000, "Năm kết thúc phải >= 2000"),
	description: z.string().optional(),
});

/**
 * Cohort Manager Component
 */
export const CohortManager: React.FC = () => {
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
	const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);

	const queryClient = useQueryClient();

	const { data: programs = [] } = useQuery({
		queryKey: ["training-programs"],
		queryFn: () => trainingProgramApi.getAll(),
	});

	const [filterProgramCode, setFilterProgramCode] = useState<string>("");

	const { data: cohorts = [], isLoading } = useQuery({
		queryKey: ["cohorts", filterProgramCode],
		queryFn: () => cohortApi.getAll({
			programCode: filterProgramCode || undefined,
		}),
	});

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateCohortRequest>({
		resolver: zodResolver(cohortSchema),
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateCohortRequest) => cohortApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cohorts"] });
			setEditModalOpen(false);
			reset();
			message.success("Tạo khóa thành công!");
		},
		onError: () => {
			message.error("Tạo khóa thất bại. Vui lòng thử lại.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string | number;
			data: CreateCohortRequest;
		}) => cohortApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cohorts"] });
			setEditModalOpen(false);
			setSelectedCohort(null);
			reset();
			message.success("Cập nhật khóa thành công!");
		},
		onError: () => {
			message.error("Cập nhật khóa thất bại. Vui lòng thử lại.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string | number) => cohortApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cohorts"] });
			setDeleteModalOpen(false);
			setSelectedCohort(null);
			message.success("Xóa khóa thành công!");
		},
		onError: () => {
			message.error("Xóa khóa thất bại. Vui lòng thử lại.");
		},
	});

	const handleCreate = async (data: CreateCohortRequest) => {
		await createMutation.mutateAsync(data);
	};

	const handleEdit = async (cohort: Cohort) => {
		setSelectedCohort(cohort);
		// Fetch latest data before editing
		try {
			const detail = await cohortApi.getById(cohort.id);
			reset({
				code: detail.code,
				programCode: detail.program?.code || "",
				startYear: detail.startYear,
				endYear: detail.endYear || detail.startYear,
				description: detail.description || "",
			});
			setEditModalOpen(true);
		} catch {
			message.error("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
		}
	};

	const handleViewDetail = async (cohort: Cohort) => {
		setSelectedCohort(cohort);
		setDetailDrawerOpen(true);
	};

	const handleUpdate = async (data: CreateCohortRequest) => {
		if (selectedCohort) {
			await updateMutation.mutateAsync({ id: selectedCohort.id, data });
		}
	};

	const handleDelete = (cohort: Cohort) => {
		setSelectedCohort(cohort);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (selectedCohort) {
			await deleteMutation.mutateAsync(selectedCohort.id);
		}
	};

	const columns: ColumnsType<Cohort> = [
		{
			title: "Mã khóa",
			dataIndex: "code",
			key: "code",
			width: 150,
		},
		{
			title: "Năm bắt đầu",
			dataIndex: "startYear",
			key: "startYear",
			width: 120,
		},
		{
			title: "Năm kết thúc",
			dataIndex: "endYear",
			key: "endYear",
			width: 120,
			render: (text) => text || "-",
		},
		{
			title: "Chương trình đào tạo",
			key: "program",
			render: (_, record) => record.program?.name || "-",
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
				<h2 className="text-xl font-semibold">Quản lý Khóa</h2>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						reset();
						setSelectedCohort(null);
						setEditModalOpen(true);
					}}
				>
					Thêm khóa
				</Button>
			</div>

			{/* Filter Section */}
			<div className="flex gap-4 mb-4">
				<Select
					placeholder="Lọc theo Chương trình Đào tạo"
					value={filterProgramCode || undefined}
					onChange={(value) => setFilterProgramCode(value || "")}
					allowClear
					showSearch
					filterOption={(input, option) =>
						(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
					}
					options={programs.map((program) => ({
						label: `${program.code} - ${program.name}`,
						value: program.code,
					}))}
					style={{ width: 300 }}
				/>
			</div>

			<Table
				columns={columns}
				dataSource={cohorts}
				loading={isLoading}
				rowKey="id"
				pagination={{ pageSize: 10 }}
			/>

			<Modal
				title={selectedCohort ? "Chỉnh sửa khóa" : "Thêm khóa mới"}
				open={editModalOpen}
				onCancel={() => {
					setEditModalOpen(false);
					setSelectedCohort(null);
					reset();
				}}
				onOk={handleSubmit(selectedCohort ? handleUpdate : handleCreate)}
				confirmLoading={isSubmitting}
				width={600}
			>
				<Form layout="vertical">
					<Form.Item
						label="Mã khóa"
						validateStatus={errors.code ? "error" : ""}
						help={errors.code?.message}
					>
						<Controller
							name="code"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập mã khóa" />
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Chương trình đào tạo"
						validateStatus={errors.programCode ? "error" : ""}
						help={errors.programCode?.message}
						required
					>
						<Controller
							name="programCode"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									placeholder="Chọn chương trình đào tạo"
									showSearch
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
									options={programs.map((program) => ({
										label: `${program.code} - ${program.name}`,
										value: program.code,
									}))}
								/>
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Năm bắt đầu"
						validateStatus={errors.startYear ? "error" : ""}
						help={errors.startYear?.message}
					>
						<Controller
							name="startYear"
							control={control}
							render={({ field }) => (
								<InputNumber
									{...field}
									min={2000}
									max={2100}
									placeholder="Nhập năm bắt đầu"
									className="w-full"
								/>
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Năm kết thúc"
						validateStatus={errors.endYear ? "error" : ""}
						help={errors.endYear?.message}
						required
					>
						<Controller
							name="endYear"
							control={control}
							render={({ field }) => (
								<InputNumber
									{...field}
									min={2000}
									max={2100}
									placeholder="Nhập năm kết thúc"
									className="w-full"
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
					setSelectedCohort(null);
				}}
				okText="Xóa"
				cancelText="Hủy"
				okButtonProps={{ danger: true }}
				confirmLoading={deleteMutation.isPending}
			>
				<p>
					Bạn có chắc chắn muốn xóa khóa <strong>{selectedCohort?.code}</strong>
					?
				</p>
			</Modal>

			<Drawer
				title="Chi tiết Khóa"
				open={detailDrawerOpen}
				onClose={() => {
					setDetailDrawerOpen(false);
					setSelectedCohort(null);
				}}
				width={600}
			>
				{selectedCohort && (
					<Descriptions column={1} bordered>
						<Descriptions.Item label="Mã khóa">
							{selectedCohort.code}
						</Descriptions.Item>
						<Descriptions.Item label="Chương trình đào tạo">
							{selectedCohort.program?.name || "-"}
						</Descriptions.Item>
						<Descriptions.Item label="Năm bắt đầu">
							{selectedCohort.startYear}
						</Descriptions.Item>
						<Descriptions.Item label="Năm kết thúc">
							{selectedCohort.endYear || "-"}
						</Descriptions.Item>
						<Descriptions.Item label="Mô tả">
							{selectedCohort.description || "-"}
						</Descriptions.Item>
					</Descriptions>
				)}
			</Drawer>
		</div>
	);
};
