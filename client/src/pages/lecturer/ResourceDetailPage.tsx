import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Space, Tabs, Spin, message, Popconfirm } from "antd";
import {
	ArrowLeftOutlined,
	DownloadOutlined,
	EyeOutlined,
	CommentOutlined,
	StarOutlined,
	DeleteOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceApi } from "@/api/resource.api";
import { courseApi } from "@/api/course.api";
import { ResourceViewer } from "@/components/modules/resource/ResourceViewer";
import { ResourceComments } from "@/components/modules/resource/ResourceComments";
import { ResourceRating } from "@/components/modules/resource/ResourceRating";
import { useAuth } from "@/hooks/useAuth";
import type { Resource } from "@/types/resource.types";
import { downloadFile } from "@/utils/file.utils";
import { formatFileSize } from "@/utils/format.utils";
import { toast } from "sonner";
import dayjs from "dayjs";

const { TabPane } = Tabs;

/**
 * Resource Detail Page - Display resource details with comments and ratings
 */
const ResourceDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [viewerOpen, setViewerOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("details");

	// Check if user can view/download this resource
	const canViewOrDownload = () => {
		// ADMIN and SUB_ADMIN can always view/download
		if (user?.type === "ADMIN" || user?.type === "SUB_ADMIN") {
			return true;
		}
		// LECTURER can view/download their own uploads even if not approved
		if (user?.type === "LECTURER" && resource?.uploadedBy?.id === user.id) {
			return true;
		}
		// Otherwise, only approved resources can be viewed/downloaded
		return resource?.approvalStatus === "APPROVED";
	};

	const { data: resource, isLoading } = useQuery({
		queryKey: ["resource", id],
		queryFn: () => resourceApi.getById(id!),
		enabled: !!id,
	});

	// Fetch course information if courseId exists
	const { data: course } = useQuery({
		queryKey: ["course", resource?.courseId],
		queryFn: () => courseApi.getById(resource!.courseId!),
		enabled: !!resource?.courseId,
	});

	const downloadMutation = useMutation({
		mutationFn: (resourceId: string) => resourceApi.download(resourceId),
		onSuccess: (blob, resourceId) => {
			const url = URL.createObjectURL(blob);
			const fileName = resource?.title || `resource-${resourceId}`;
			downloadFile(url, fileName);
			message.success("Tải xuống thành công!");
		},
		onError: () => {
			message.error("Tải xuống thất bại. Vui lòng thử lại.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (resourceId: string) => resourceApi.delete(resourceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resources"] });
			toast.success("Xóa học liệu thành công!");
			navigate(-1);
		},
		onError: () => {
			toast.error("Xóa học liệu thất bại. Vui lòng thử lại.");
		},
	});

	// Check if user can delete this resource
	const canDelete = () => {
		if (!user || !resource) return false;
		// ADMIN can delete any resource
		if (user.type === "ADMIN") return true;
		// LECTURER can delete their own uploads
		if (user.type === "LECTURER" && resource.uploadedBy?.id === user.id) return true;
		// SUB_ADMIN can delete resources in same department
		if (user.type === "SUB_ADMIN" && resource.uploadedBy?.department?.id === user.department?.id) return true;
		return false;
	};

	const handleView = () => {
		setViewerOpen(true);
	};

	const handleDownload = () => {
		if (resource) {
			downloadMutation.mutate(resource.id);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spin size="large" />
			</div>
		);
	}

	if (!resource) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card>
					<p className="text-gray-500">Không tìm thấy học liệu</p>
					<Button onClick={() => navigate(-1)} className="mt-4">
						Quay lại
					</Button>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
					Quay lại
				</Button>
				<Space>
					{canDelete() && (
						<Popconfirm
							title="Xóa học liệu"
							description="Bạn có chắc chắn muốn xóa học liệu này? Hành động này không thể hoàn tác."
							onConfirm={() => deleteMutation.mutate(resource.id)}
							okText="Xóa"
							cancelText="Hủy"
							okButtonProps={{ danger: true }}
						>
							<Button
								danger
								icon={<DeleteOutlined />}
								loading={deleteMutation.isPending}
							>
								Xóa
							</Button>
						</Popconfirm>
					)}
					<Button
						icon={<EyeOutlined />}
						onClick={handleView}
						disabled={!canViewOrDownload()}
					>
						Xem
					</Button>
					<Button
						type="primary"
						icon={<DownloadOutlined />}
						onClick={handleDownload}
						loading={downloadMutation.isPending}
						disabled={!canViewOrDownload()}
					>
						Tải xuống
					</Button>
				</Space>
			</div>

			{/* Resource Details */}
			<Card>
				<div className="space-y-4">
					<h1 className="text-2xl font-bold">{resource.title}</h1>

					{resource.description && (
						<p className="text-gray-700">{resource.description}</p>
					)}

					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="font-semibold">Học phần: </span>
							{course?.title || course?.name || resource.courseId || "-"}
						</div>
						<div>
							<span className="font-semibold">Loại học liệu: </span>
							{resource.type?.name || "-"}
						</div>
						<div>
							<span className="font-semibold">Trạng thái: </span>
							{resource.approvalStatus === "APPROVED"
								? "Đã duyệt"
								: resource.approvalStatus === "PENDING"
								? "Chờ duyệt"
								: "Từ chối"}
						</div>
						{resource.sizeBytes && (
							<div>
								<span className="font-semibold">Kích thước: </span>
								{formatFileSize(resource.sizeBytes)}
							</div>
						)}
						{resource.createdAt && (
							<div>
								<span className="font-semibold">Ngày tải lên: </span>
								{dayjs(resource.createdAt).format("DD/MM/YYYY HH:mm")}
							</div>
						)}
						{resource.uploadedBy && (
							<div>
								<span className="font-semibold">Người upload: </span>
								{resource.uploadedBy.fullName}
							</div>
						)}
						{resource.stats && (
							<>
								<div>
									<span className="font-semibold">Lượt xem: </span>
									{resource.stats.views || 0}
								</div>
								<div>
									<span className="font-semibold">Lượt tải: </span>
									{resource.stats.downloads || 0}
								</div>
							</>
						)}
					</div>
				</div>
			</Card>

			{/* Tabs for Comments and Ratings */}
			{resource.approvalStatus === "APPROVED" && (
				<Tabs activeKey={activeTab} onChange={setActiveTab}>
					<TabPane
						tab={
							<span>
								<StarOutlined /> Đánh giá
							</span>
						}
						key="rating"
					>
						<ResourceRating
							resourceId={resource.id}
							resourceApproved={resource.approvalStatus === "APPROVED"}
						/>
					</TabPane>
					<TabPane
						tab={
							<span>
								<CommentOutlined /> Bình luận
							</span>
						}
						key="comments"
					>
						<ResourceComments
							resourceId={resource.id}
							resourceApproved={resource.approvalStatus === "APPROVED"}
						/>
					</TabPane>
				</Tabs>
			)}

			{/* Resource Viewer Modal */}
			<ResourceViewer
				resource={resource}
				open={viewerOpen}
				onClose={() => setViewerOpen(false)}
			/>
		</div>
	);
};

export default ResourceDetailPage;

