import { useState } from "react";
import {
	Table,
	Button,
	Space,
	Modal,
	Form,
	Input,
	message,
	Input as AntInput,
	Descriptions,
	Drawer,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
	SearchOutlined,
	EyeOutlined,
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { trainingProgramApi } from "@/api/training-program.api";
import type {
	TrainingProgram,
	CreateTrainingProgramRequest,
} from "@/types/department.types";

const trainingProgramSchema = z.object({
	name: z.string().min(1, "Tên chương trình không được để trống"),
	code: z.string().min(1, "Mã chương trình không được để trống"),
	description: z.string().optional(),
});

/**
 * Training Program Manager Component
 */
export const TrainingProgramManager: React.FC = () => {
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
	const [selectedProgram, setSelectedProgram] =
		useState<TrainingProgram | null>(null);
	const [filterCode, setFilterCode] = useState<string>("");
	const [filterName, setFilterName] = useState<string>("");

	// Debounce filter values to avoid too many API calls
	const debouncedFilterCode = useDebounce(filterCode, 500);
	const debouncedFilterName = useDebounce(filterName, 500);

	const queryClient = useQueryClient();

	const { data: programs = [], isLoading } = useQuery({
		queryKey: ["training-programs", debouncedFilterCode, debouncedFilterName],
		queryFn: () =>
			trainingProgramApi.getAll({
				code: debouncedFilterCode || undefined,
				name: debouncedFilterName || undefined,
			}),
	});

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateTrainingProgramRequest>({
		resolver: zodResolver(trainingProgramSchema),
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateTrainingProgramRequest) =>
			trainingProgramApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["training-programs"] });
			setEditModalOpen(false);
			reset();
			message.success("Tạo chương trình đào tạo thành công!");
		},
		onError: () => {
			message.error("Tạo chương trình đào tạo thất bại. Vui lòng thử lại.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: CreateTrainingProgramRequest;
		}) => trainingProgramApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["training-programs"] });
			setEditModalOpen(false);
			setSelectedProgram(null);
			reset();
			message.success("Cập nhật chương trình đào tạo thành công!");
		},
		onError: () => {
			message.error(
				"Cập nhật chương trình đào tạo thất bại. Vui lòng thử lại."
			);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => trainingProgramApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["training-programs"] });
			setDeleteModalOpen(false);
			setSelectedProgram(null);
			message.success("Xóa chương trình đào tạo thành công!");
		},
		onError: () => {
			message.error("Xóa chương trình đào tạo thất bại. Vui lòng thử lại.");
		},
	});

	const handleCreate = async (data: CreateTrainingProgramRequest) => {
		await createMutation.mutateAsync(data);
	};

	const handleEdit = async (program: TrainingProgram) => {
		setSelectedProgram(program);
		// Fetch latest data before editing
		try {
			const detail = await trainingProgramApi.getById(program.id);
			reset({
				name: detail.name,
				code: detail.code,
				description: detail.description || "",
			});
			setEditModalOpen(true);
		} catch {
			message.error("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
		}
	};

	const handleViewDetail = async (program: TrainingProgram) => {
		setSelectedProgram(program);
		setDetailDrawerOpen(true);
	};

	const handleUpdate = async (data: CreateTrainingProgramRequest) => {
		if (selectedProgram) {
			await updateMutation.mutateAsync({ id: selectedProgram.id, data });
		}
	};

	const handleDelete = (program: TrainingProgram) => {
		setSelectedProgram(program);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (selectedProgram) {
			await deleteMutation.mutateAsync(selectedProgram.id);
		}
	};

	const columns: ColumnsType<TrainingProgram> = [
		{
			title: "Mã CTĐT",
			dataIndex: "code",
			key: "code",
			width: 150,
		},
		{
			title: "Tên chương trình",
			dataIndex: "name",
			key: "name",
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
				<h2 className="text-xl font-semibold">Quản lý Chương trình Đào tạo</h2>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						reset();
						setSelectedProgram(null);
						setEditModalOpen(true);
					}}
				>
					Thêm CTĐT
				</Button>
			</div>

			{/* Filter Section */}
			<div className="flex gap-4">
				<AntInput
					placeholder="Lọc theo mã CTĐT"
					prefix={<SearchOutlined />}
					value={filterCode}
					onChange={(e) => setFilterCode(e.target.value)}
					allowClear
					style={{ width: 200 }}
				/>
				<AntInput
					placeholder="Lọc theo tên"
					prefix={<SearchOutlined />}
					value={filterName}
					onChange={(e) => setFilterName(e.target.value)}
					allowClear
					style={{ width: 200 }}
				/>
			</div>

			<Table
				columns={columns}
				dataSource={programs}
				loading={isLoading}
				rowKey="id"
				pagination={{ pageSize: 10 }}
			/>

			<Modal
				title={selectedProgram ? "Chỉnh sửa CTĐT" : "Thêm CTĐT mới"}
				open={editModalOpen}
				onCancel={() => {
					setEditModalOpen(false);
					setSelectedProgram(null);
					reset();
				}}
				onOk={handleSubmit(selectedProgram ? handleUpdate : handleCreate)}
				confirmLoading={isSubmitting}
				width={600}
			>
				<Form layout="vertical">
					<Form.Item
						label="Mã CTĐT"
						validateStatus={errors.code ? "error" : ""}
						help={errors.code?.message}
					>
						<Controller
							name="code"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập mã CTĐT" />
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Tên chương trình"
						validateStatus={errors.name ? "error" : ""}
						help={errors.name?.message}
					>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập tên chương trình" />
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
					setSelectedProgram(null);
				}}
				okText="Xóa"
				cancelText="Hủy"
				okButtonProps={{ danger: true }}
				confirmLoading={deleteMutation.isPending}
			>
				<p>
					Bạn có chắc chắn muốn xóa chương trình đào tạo{" "}
					<strong>{selectedProgram?.name}</strong>?
				</p>
			</Modal>

			<Drawer
				title="Chi tiết Chương trình Đào tạo"
				open={detailDrawerOpen}
				onClose={() => {
					setDetailDrawerOpen(false);
					setSelectedProgram(null);
				}}
				width={600}
			>
				{selectedProgram && (
					<Descriptions column={1} bordered>
						<Descriptions.Item label="Mã CTĐT">
							{selectedProgram.code}
						</Descriptions.Item>
						<Descriptions.Item label="Tên chương trình">
							{selectedProgram.name}
						</Descriptions.Item>
						<Descriptions.Item label="Mô tả">
							{selectedProgram.description || "-"}
						</Descriptions.Item>
					</Descriptions>
				)}
			</Drawer>
		</div>
	);
};
