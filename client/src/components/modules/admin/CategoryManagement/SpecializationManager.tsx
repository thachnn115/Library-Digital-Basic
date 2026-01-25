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
import { specializationApi } from "@/api/specialization.api";
import { trainingProgramApi } from "@/api/training-program.api";
import type {
	Specialization,
	CreateSpecializationRequest,
} from "@/types/department.types";

const specializationSchema = z.object({
	name: z.string().min(1, "Tên chuyên ngành không được để trống"),
	code: z.string().min(1, "Mã chuyên ngành không được để trống"),
	description: z.string().optional(),
	programCodes: z
			.array(z.string().min(1, "Phải chọn Chương Trình Đào Tạo"))
			.min(1, "Phải chọn Chương Trình Đào Tạo"),
});

/**
 * Specialization Manager Component
 */
export const SpecializationManager: React.FC = () => {
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
	const [selectedSpecialization, setSelectedSpecialization] =
		useState<Specialization | null>(null);

	const queryClient = useQueryClient();

	const { data: programs = [] } = useQuery({
		queryKey: ["training-programs"],
		queryFn: () => trainingProgramApi.getAll(),
	});

	const [filterProgramCode, setFilterProgramCode] = useState<string>("");

	const { data: specializations = [], isLoading } = useQuery({
		queryKey: ["specializations", filterProgramCode],
		queryFn: () =>
			specializationApi.getAll({
				programCode: filterProgramCode || undefined,
			}),
	});

	const filteredSpecializations = specializations;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateSpecializationRequest>({
		resolver: zodResolver(specializationSchema),
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateSpecializationRequest) =>
			specializationApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["specializations"] });
			reset();
			message.success("Tạo chuyên ngành thành công!");
		},
		onError: () => {
			message.error("Tạo chuyên ngành thất bại. Vui lòng thử lại.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string | number;
			data: CreateSpecializationRequest;
		}) => specializationApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["specializations"] });
			setEditModalOpen(false);
			setSelectedSpecialization(null);
			reset();
			message.success("Cập nhật chuyên ngành thành công!");
		},
		onError: () => {
			message.error("Cập nhật chuyên ngành thất bại. Vui lòng thử lại.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string | number) => specializationApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["specializations"] });
			setDeleteModalOpen(false);
			setSelectedSpecialization(null);
			message.success("Xóa chuyên ngành thành công!");
		},
		onError: () => {
			message.error("Xóa chuyên ngành thất bại. Vui lòng thử lại.");
		},
	});

	const handleCreate = async (data: CreateSpecializationRequest) => {
		await createMutation.mutateAsync(data);
	};

	const handleEdit = async (specialization: Specialization) => {
		setSelectedSpecialization(specialization);
		// Fetch latest data before editing
		try {
			const detail = await specializationApi.getById(specialization.id);
			reset({
				name: detail.name,
				code: detail.code,
				description: detail.description || "",
				programCodes:
					detail.programs?.map((program) => program.code) ||
					(detail.program?.code
						? [detail.program.code]
						: detail.trainingProgram?.code
							? [detail.trainingProgram.code]
							: []),
			});
			setEditModalOpen(true);
		} catch {
			message.error("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
		}
	};

	const handleViewDetail = async (specialization: Specialization) => {
		setSelectedSpecialization(specialization);
		setDetailDrawerOpen(true);
	};

	const handleUpdate = async (data: CreateSpecializationRequest) => {
		if (selectedSpecialization) {
			await updateMutation.mutateAsync({
				id: selectedSpecialization.id,
				data,
			});
		}
	};

	const handleDelete = (specialization: Specialization) => {
		setSelectedSpecialization(specialization);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (selectedSpecialization) {
			await deleteMutation.mutateAsync(selectedSpecialization.id);
		}
	};

	const columns: ColumnsType<Specialization> = [
		{
			title: "Mã chuyên ngành",
			dataIndex: "code",
			key: "code",
			width: 150,
		},
		{
			title: "Tên chuyên ngành",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Chương trình đào tạo",
			key: "trainingProgram",
			render: (_, record) => {
			const programNames =
				record.programs?.map((program) => program.name).filter(Boolean) || [];
			if (programNames.length > 0) {
				return programNames.join(", ");
			}
			return record.program?.name || record.trainingProgram?.name || "-";
		},
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
				<h2 className="text-xl font-semibold">Quản lý Chuyên ngành</h2>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						reset();
						setSelectedSpecialization(null);
						setEditModalOpen(true);
					}}
				>
					Thêm chuyên ngành
				</Button>
			</div>

			{/* Filter Section */}
			<div className="flex gap-4 mb-4">
				<Select
					placeholder="Lọc theo Chương Trình Đào Tạo"
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
					style={{ width: 250 }}
				/>
			</div>


			<Table
				columns={columns}
				dataSource={filteredSpecializations}
				loading={isLoading}
				rowKey="id"
				pagination={{ pageSize: 10 }}
			/>

			<Modal
				title={
					selectedSpecialization
						? "Chỉnh sửa chuyên ngành"
						: "Thêm chuyên ngành mới"
				}
				open={editModalOpen}
				onCancel={() => {
					setEditModalOpen(false);
					setSelectedSpecialization(null);
					reset();
				}}
				onOk={handleSubmit(
					selectedSpecialization ? handleUpdate : handleCreate
				)}
				confirmLoading={isSubmitting}
				width={600}
			>
				<Form layout="vertical">
				<Form.Item
					label="Mã chuyên ngành"
					validateStatus={errors.code ? "error" : ""}
					help={errors.code?.message}
				>
					<Controller
						name="code"
						control={control}
						render={({ field }) => (
							<Input {...field} placeholder="Nhập mã chuyên ngành" />
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Tên chuyên ngành"
					validateStatus={errors.name ? "error" : ""}
					help={errors.name?.message}
				>
					<Controller
						name="name"
						control={control}
						render={({ field }) => (
							<Input {...field} placeholder="Nhập tên chuyên nhành" />
						)}
					/>
				</Form.Item>

				<Form.Item
					label="Chương Trình Đào Tạo"
					validateStatus={errors.programCodes ? "error" : ""}
					help={errors.programCodes?.message}
					required
				>
					<Controller
						name="programCodes"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder="Chọn Chương Trình Đào Tạo"
								mode="multiple"
								showSearch
								filterOption={(input, option) =>
									(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
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
								placeholder="Nhập mô tả"
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
					setSelectedSpecialization(null);
				}}
				okText="Xóa"
				cancelText="Hủy"
				okButtonProps={{ danger: true }}
				confirmLoading={deleteMutation.isPending}
			>
				<p>
					Bạn có chắc chắn muốn xóa chuyên ngành{" "}
					<strong>{selectedSpecialization?.name}</strong>?
				</p>
			</Modal>

			<Drawer
				title="Chi tiết Chuyên ngành"
				open={detailDrawerOpen}
				onClose={() => {
					setDetailDrawerOpen(false);
					setSelectedSpecialization(null);
				}}
				width={600}
			>
				{selectedSpecialization && (
					<Descriptions column={1} bordered>
						<Descriptions.Item label="Mã chuyên ngành">
							{selectedSpecialization.code}
						</Descriptions.Item>
						<Descriptions.Item label="Tên chuyên ngành">
							{selectedSpecialization.name}
						</Descriptions.Item>
						<Descriptions.Item label="Chương Trình Đào Tạo">
							{selectedSpecialization.programs && selectedSpecialization.programs.length > 0
								? selectedSpecialization.programs
										.map((program) => program.name)
										.filter(Boolean)
										.join(", ")
								: selectedSpecialization.program?.name || selectedSpecialization.trainingProgram?.name || "-"}
						</Descriptions.Item>
						<Descriptions.Item label="Mô tả">
							{selectedSpecialization.description || "-"}
						</Descriptions.Item>
					</Descriptions>
				)}
			</Drawer>
		</div>
	);
};
