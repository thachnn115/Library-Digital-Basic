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
import { departmentApi } from "@/api/department.api";
import type {
	Department,
	CreateDepartmentRequest,
} from "@/types/department.types";

const departmentSchema = z.object({
	name: z.string().min(1, "Tên khoa không được để trống"),
	code: z.string().min(1, "Mã khoa không được để trống"),
	description: z.string().optional(),
});

/**
 * Helper function để xử lý lỗi từ API response
 */
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
	if (error && typeof error === "object" && "response" in error) {
		const axiosError = error as {
			response?: {
				data?: {
					message?: string;
					error?: string;
				};
			};
		};

		const responseData = axiosError.response?.data;
		const message =
			responseData?.message || responseData?.error || defaultMessage;

		// Kiểm tra lỗi foreign key constraint
		const lowerMessage = message.toLowerCase();
		if (
			lowerMessage.includes("foreign key") ||
			lowerMessage.includes("constraint") ||
			lowerMessage.includes("cannot delete") ||
			lowerMessage.includes("cannot update") ||
			lowerMessage.includes("parent row")
		) {
			return "Không thể xóa khoa này vì đang có người dùng hoặc dữ liệu liên quan. Vui lòng xóa hoặc chuyển các dữ liệu liên quan trước.";
		}

		return message;
	}

	return defaultMessage;
};

/**
 * Department Manager Component
 */
export const DepartmentManager: React.FC = () => {
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
	const [selectedDepartment, setSelectedDepartment] =
		useState<Department | null>(null);

	const queryClient = useQueryClient();

	const { data: departments = [], isLoading } = useQuery({
		queryKey: ["departments"],
		queryFn: () => departmentApi.getAll(),
	});

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateDepartmentRequest>({
		resolver: zodResolver(departmentSchema),
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateDepartmentRequest) => departmentApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["departments"] });
			setEditModalOpen(false);
			reset();
			message.success("Tạo khoa thành công!");
		},
		onError: (error: unknown) => {
			const errorMessage = getErrorMessage(
				error,
				"Tạo khoa thất bại. Vui lòng thử lại."
			);
			message.error(errorMessage);
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: CreateDepartmentRequest }) =>
			departmentApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["departments"] });
			setEditModalOpen(false);
			setSelectedDepartment(null);
			reset();
			message.success("Cập nhật khoa thành công!");
		},
		onError: (error: unknown) => {
			const errorMessage = getErrorMessage(
				error,
				"Cập nhật khoa thất bại. Vui lòng thử lại."
			);
			message.error(errorMessage);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => departmentApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["departments"] });
			setDeleteModalOpen(false);
			setSelectedDepartment(null);
			message.success("Xóa khoa thành công!");
		},
		onError: (error: unknown) => {
			const errorMessage = getErrorMessage(
				error,
				"Xóa khoa thất bại. Vui lòng thử lại."
			);
			message.error(errorMessage);
		},
	});

	const handleCreate = async (data: CreateDepartmentRequest) => {
		await createMutation.mutateAsync(data);
	};

	const handleEdit = async (department: Department) => {
		setSelectedDepartment(department);
		// Fetch latest data before editing
		try {
			const detail = await departmentApi.getById(department.id);
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

	const handleViewDetail = async (department: Department) => {
		setSelectedDepartment(department);
		setDetailDrawerOpen(true);
	};

	const handleUpdate = async (data: CreateDepartmentRequest) => {
		if (selectedDepartment) {
			await updateMutation.mutateAsync({ id: selectedDepartment.id, data });
		}
	};

	const handleDelete = (department: Department) => {
		setSelectedDepartment(department);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (selectedDepartment) {
			await deleteMutation.mutateAsync(selectedDepartment.id);
		}
	};

	const columns: ColumnsType<Department> = [
		{
			title: "Mã khoa",
			dataIndex: "code",
			key: "code",
			width: 150,
		},
		{
			title: "Tên khoa",
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
				<h2 className="text-xl font-semibold">Quản lý Khoa</h2>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						reset();
						setSelectedDepartment(null);
						setEditModalOpen(true);
					}}
				>
					Thêm khoa
				</Button>
			</div>

			<Table
				columns={columns}
				dataSource={departments}
				loading={isLoading}
				rowKey="id"
				pagination={{ pageSize: 10 }}
			/>

			<Modal
				title={selectedDepartment ? "Chỉnh sửa khoa" : "Thêm khoa mới"}
				open={editModalOpen}
				onCancel={() => {
					setEditModalOpen(false);
					setSelectedDepartment(null);
					reset();
				}}
				onOk={handleSubmit(selectedDepartment ? handleUpdate : handleCreate)}
				confirmLoading={isSubmitting}
			>
				<Form layout="vertical">
					<Form.Item
						label="Mã khoa"
						validateStatus={errors.code ? "error" : ""}
						help={errors.code?.message}
					>
						<Controller
							name="code"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập mã khoa" />
							)}
						/>
					</Form.Item>

					<Form.Item
						label="Tên khoa"
						validateStatus={errors.name ? "error" : ""}
						help={errors.name?.message}
					>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder="Nhập tên khoa" />
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
					setSelectedDepartment(null);
				}}
				okText="Xóa"
				cancelText="Hủy"
				okButtonProps={{ danger: true }}
				confirmLoading={deleteMutation.isPending}
			>
				<p>
					Bạn có chắc chắn muốn xóa khoa{" "}
					<strong>{selectedDepartment?.name}</strong>?
				</p>
			</Modal>

			<Drawer
				title="Chi tiết Khoa"
				open={detailDrawerOpen}
				onClose={() => {
					setDetailDrawerOpen(false);
					setSelectedDepartment(null);
				}}
				width={600}
			>
				{selectedDepartment && (
					<Descriptions column={1} bordered>
						<Descriptions.Item label="Mã khoa">
							{selectedDepartment.code}
						</Descriptions.Item>
						<Descriptions.Item label="Tên khoa">
							{selectedDepartment.name}
						</Descriptions.Item>
						<Descriptions.Item label="Mô tả">
							{selectedDepartment.description || "-"}
						</Descriptions.Item>
					</Descriptions>
				)}
			</Drawer>
		</div>
	);
};
