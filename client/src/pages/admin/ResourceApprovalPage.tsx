import { useState, useMemo } from "react";
import { Card, Table, Button, Space, Tag, Select, message, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { resourceApi } from "@/api/resource.api";
import { courseApi } from "@/api/course.api";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import type { Resource } from "@/types/resource.types";
import { toast } from "sonner";

/**
 * Resource Approval Page - For ADMIN and SUB_ADMIN
 * ADMIN: Can manage all resources
 * SUB_ADMIN: Can only manage resources in their department
 */
const ResourceApprovalPage: React.FC = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const isSubAdmin = user?.type === "SUB_ADMIN";
	const [statusFilter, setStatusFilter] = useState<
		"PENDING" | "APPROVED" | "REJECTED" | "ALL"
	>("PENDING");

	const queryClient = useQueryClient();

	// Fetch all resources (backend will filter by role)
	const { data: allResources = [], isLoading } = useQuery({
		queryKey: ["resources", "all"],
		queryFn: () => resourceApi.getAll({}),
	});

	// Fetch all courses to map courseId to course title
	const { data: allCourses = [] } = useQuery({
		queryKey: ["courses", "all"],
		queryFn: () => courseApi.getAll({}),
	});

	// Create a map of courseId to course title for quick lookup
	const courseMap = useMemo(() => {
		const map = new Map<string, string>();
		allCourses.forEach((course) => {
			if (course.id) {
				map.set(course.id.toString(), course.title || course.name || course.id.toString());
			}
		});
		return map;
	}, [allCourses]);

	// Filter resources by status
	const filteredResources = allResources.filter((resource) => {
		if (statusFilter === "ALL") return true;
		return resource.approvalStatus === statusFilter;
	});

	const approveMutation = useMutation({
		mutationFn: (id: string) =>
			resourceApi.updateApprovalStatus(id, "APPROVED"),
		onSuccess: () => {
			// Invalidate all resource-related queries to update both admin and lecturer views
			queryClient.invalidateQueries({ queryKey: ["resources"] });
			queryClient.invalidateQueries({ queryKey: ["my-uploads"] }); // Update lecturer's view
			queryClient.invalidateQueries({ queryKey: ["resource"] }); // Update resource detail if open
			toast.success("Duyệt học liệu thành công!");
		},
		onError: () => {
			toast.error("Duyệt học liệu thất bại. Vui lòng thử lại.");
		},
	});

	const rejectMutation = useMutation({
		mutationFn: (id: string) =>
			resourceApi.updateApprovalStatus(id, "REJECTED"),
		onSuccess: () => {
			// Invalidate all resource-related queries to update both admin and lecturer views
			queryClient.invalidateQueries({ queryKey: ["resources"] });
			queryClient.invalidateQueries({ queryKey: ["my-uploads"] }); // Update lecturer's view
			queryClient.invalidateQueries({ queryKey: ["resource"] }); // Update resource detail if open
			toast.success("Từ chối học liệu thành công!");
		},
		onError: () => {
			toast.error("Từ chối học liệu thất bại. Vui lòng thử lại.");
		},
	});

	const getStatusTag = (status: "PENDING" | "APPROVED" | "REJECTED") => {
		switch (status) {
			case "APPROVED":
				return <Tag color="green">Đã duyệt</Tag>;
			case "PENDING":
				return <Tag color="orange">Chờ duyệt</Tag>;
			case "REJECTED":
				return <Tag color="red">Từ chối</Tag>;
			default:
				return <Tag>{status}</Tag>;
		}
	};

	const columns: ColumnsType<Resource> = [
		{
			title: "Tiêu đề",
			dataIndex: "title",
			key: "title",
			width: 300,
		},
		{
			title: "Người upload",
			key: "uploadedBy",
			render: (_, record) => record.uploadedBy?.fullName || "-",
		},
		{
			title: "Học phần",
			key: "course",
			render: (_, record) => {
				if (record.courseId) {
					return courseMap.get(record.courseId) || record.courseId;
				}
				return "-";
			},
		},
		{
			title: "Loại",
			key: "type",
			render: (_, record) => record.type?.name || "-",
		},
		{
			title: "Trạng thái",
			dataIndex: "approvalStatus",
			key: "approvalStatus",
			render: (status) => getStatusTag(status),
		},
		{
			title: "Ngày upload",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "-"),
		},
		{
			title: "Thao tác",
			key: "actions",
			width: 250,
			render: (_, record) => (
				<Space>
					<Button
						size="small"
						icon={<EyeOutlined />}
						onClick={() => navigate(ROUTES.RESOURCES_DETAIL.replace(":id", record.id))}
					>
						Xem chi tiết
					</Button>
					{record.approvalStatus === "PENDING" && (
						<>
							<Button
								type="primary"
								size="small"
								icon={<CheckOutlined />}
								onClick={() => approveMutation.mutate(record.id)}
								loading={approveMutation.isPending}
							>
								Duyệt
							</Button>
							<Button
								danger
								size="small"
								icon={<CloseOutlined />}
								onClick={() => rejectMutation.mutate(record.id)}
								loading={rejectMutation.isPending}
							>
								Từ chối
							</Button>
						</>
					)}
					{record.approvalStatus === "APPROVED" && (
						<Button
							danger
							size="small"
							icon={<CloseOutlined />}
							onClick={() => rejectMutation.mutate(record.id)}
							loading={rejectMutation.isPending}
						>
							Hủy duyệt
						</Button>
					)}
					{record.approvalStatus === "REJECTED" && (
						<Button
							type="primary"
							size="small"
							icon={<CheckOutlined />}
							onClick={() => approveMutation.mutate(record.id)}
							loading={approveMutation.isPending}
						>
							Duyệt lại
						</Button>
					)}
				</Space>
			),
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Duyệt học liệu</h1>
					{isSubAdmin && (
						<p className="text-sm text-gray-600 mt-1">
							Quản lý học liệu trong khoa {user?.department?.name || "của bạn"}
						</p>
					)}
				</div>
				<Select
					value={statusFilter}
					onChange={(value) => setStatusFilter(value)}
					style={{ width: 200 }}
					options={[
						{ label: "Tất cả", value: "ALL" },
						{ label: "Chờ duyệt", value: "PENDING" },
						{ label: "Đã duyệt", value: "APPROVED" },
						{ label: "Từ chối", value: "REJECTED" },
					]}
				/>
			</div>

			{isSubAdmin && (
				<Alert
					message="Quản lý học liệu trong khoa"
					description={`Bạn chỉ có thể xem và duyệt các học liệu thuộc khoa ${user?.department?.name || "của bạn"}. Backend sẽ tự động lọc các học liệu theo khoa của bạn.`}
					type="info"
					showIcon
					className="mb-4"
				/>
			)}

			<Card>
				<Table
					columns={columns}
					dataSource={filteredResources}
					loading={isLoading}
					rowKey="id"
					pagination={{ pageSize: 20 }}
				/>
			</Card>
		</div>
	);
};

export default ResourceApprovalPage;

