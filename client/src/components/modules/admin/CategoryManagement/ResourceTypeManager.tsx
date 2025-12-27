import { useState } from "react";
import {
	Table,
	Button,
	Space,
	Modal,
	Form,
	Input,
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
import { resourceTypeApi } from "@/api/resource-type.api";
import type {
	ResourceType,
	CreateResourceTypeRequest,
} from "@/types/department.types";

const resourceTypeSchema = z.object({
	name: z.string().min(1, "Tên loại học liệu không được để trống"),
	code: z.string().min(1, "Mã loại học liệu không được để trống"),
	description: z.string().optional(),
});

/**
 * Resource Type Manager Component
 */
export const ResourceTypeManager: React.FC = () => {
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
	const [selectedResourceType, setSelectedResourceType] =
		useState<ResourceType | null>(null);

	const queryClient = useQueryClient();

	const { data: resourceTypes = [], isLoading } = useQuery({
		queryKey: ["resource-types"],
		queryFn: () => resourceTypeApi.getAll(),
	});

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateResourceTypeRequest>({
		resolver: zodResolver(resourceTypeSchema),
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateResourceTypeRequest) =>
			resourceTypeApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resource-types"] });
			reset();
			message.success("Tạo loại học liệu thành công!");
		},
		onError: () => {
			message.error("Tạo loại học liệu thất bại. Vui lòng thử lại.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: CreateResourceTypeRequest;
		}) => resourceTypeApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resource-types"] });
			setEditModalOpen(false);
			setSelectedResourceType(null);
			reset();
			message.success("Cập nhật loại học liệu thành công!");
		},
		onError: () => {
			message.error("Cập nhật loại học liệu thất bại. Vui lòng thử lại.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => resourceTypeApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resource-types"] });
			setDeleteModalOpen(false);
			setSelectedResourceType(null);
			message.success("Xóa loại học liệu thành công!");
		},
		onError: () => {
			message.error("Xóa loại học liệu thất bại. Vui lòng thử lại.");
		},
	});

	const handleCreate = async (data: CreateResourceTypeRequest) => {
		await createMutation.mutateAsync(data);
	};

	const handleEdit = async (resourceType: ResourceType) => {
		setSelectedResourceType(resourceType);
		// Fetch latest data before editing
		try {
			const detail = await resourceTypeApi.getById(resourceType.id);
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

	const handleViewDetail = async (resourceType: ResourceType) => {
		setSelectedResourceType(resourceType);
		setDetailDrawerOpen(true);
	};

	const handleUpdate = async (data: CreateResourceTypeRequest) => {
		if (selectedResourceType) {
			await updateMutation.mutateAsync({
				id: selectedResourceType.id,
				data,
			});
		}
	};

	const handleDelete = (resourceType: ResourceType) => {
		setSelectedResourceType(resourceType);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (selectedResourceType) {
			await deleteMutation.mutateAsync(selectedResourceType.id);
		}
	};

	const columns: ColumnsType<ResourceType> = [
		{
			title: "Mã loại",
			dataIndex: "code",
			key: "code",
			width: 150,
		},
		{
			title: "Tên loại học liệu",
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
				<h2 className="text-xl font-semibold">Quản lý Loại học liệu</h2>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						reset();
						setSelectedResourceType(null);
						setEditModalOpen(true);
					}}
				>
					Thêm loại học liệu
				</Button>
			</div>

			<Table
				columns={columns}
				dataSource={resourceTypes}
				loading={isLoading}
				rowKey="id"
				pagination={{ pageSize: 10 }}
			/>

			<Modal
				title={
					selectedResourceType
						? "Chỉnh sửa loại học liệu"
						: "Thêm loại học liệu mới"
				}
				open={editModalOpen}
				onCancel={() => {
					setEditModalOpen(false);
					setSelectedResourceType(null);
					reset();
				}}
				onOk={handleSubmit(selectedResourceType ? handleUpdate : handleCreate)}
				confirmLoading={isSubmitting}
			>
				<Form layout="vertical">
					<Form.Item
						label="Mã loại"
						validateStatus={errors.code ? "error" : ""}
						help={errors.code?.message}
					>
						<Controller
							name="code"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập mã loại" />
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Tên loại học liệu"
						validateStatus={errors.name ? "error" : ""}
						help={errors.name?.message}
					>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập tên loại học liệu" />
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
					setSelectedResourceType(null);
				}}
				okText="Xóa"
				cancelText="Hủy"
				okButtonProps={{ danger: true }}
				confirmLoading={deleteMutation.isPending}
			>
				<p>
					Bạn có chắc chắn muốn xóa loại học liệu{" "}
					<strong>{selectedResourceType?.name}</strong>?
				</p>
			</Modal>

			<Drawer
				title="Chi tiết Loại học liệu"
				open={detailDrawerOpen}
				onClose={() => {
					setDetailDrawerOpen(false);
					setSelectedResourceType(null);
				}}
				width={600}
			>
				{selectedResourceType && (
					<Descriptions column={1} bordered>
						<Descriptions.Item label="Mã loại">
							{selectedResourceType.code}
						</Descriptions.Item>
						<Descriptions.Item label="Tên loại học liệu">
							{selectedResourceType.name}
						</Descriptions.Item>
						<Descriptions.Item label="Mô tả">
							{selectedResourceType.description || "-"}
						</Descriptions.Item>
					</Descriptions>
				)}
			</Drawer>
		</div>
	);
};
