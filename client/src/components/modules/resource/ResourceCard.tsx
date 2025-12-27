import { Card, Button, Tag, Tooltip } from "antd";
import {
	EyeOutlined,
	DownloadOutlined,
	FileTextOutlined,
	UserOutlined,
	InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import type { Resource } from "@/types/resource.types";
import { formatFileSize } from "@/utils/format.utils";
import dayjs from "dayjs";
import clsx from "clsx";

interface ResourceCardProps {
	resource: Resource;
	onView?: (resource: Resource) => void;
	onDownload?: (resource: Resource) => void;
	className?: string;
}

/**
 * Resource Card Component displaying resource information
 */
export const ResourceCard: React.FC<ResourceCardProps> = ({
	resource,
	onView,
	onDownload,
	className,
}) => {
	const navigate = useNavigate();
	const { user } = useAuth();

	// Check if user can view/download this resource
	const canViewOrDownload = () => {
		// ADMIN and SUB_ADMIN can always view/download
		if (user?.type === "ADMIN" || user?.type === "SUB_ADMIN") {
			return true;
		}
		// LECTURER can view/download their own uploads even if not approved
		if (user?.type === "LECTURER" && resource.uploadedBy?.id === user.id) {
			return true;
		}
		// Otherwise, only approved resources can be viewed/downloaded
		return resource.approvalStatus === "APPROVED";
	};

	const handleDetail = () => {
		navigate(ROUTES.RESOURCES_DETAIL.replace(":id", resource.id));
	};
	const getApprovalStatusColor = (
		status: "PENDING" | "APPROVED" | "REJECTED"
	) => {
		switch (status) {
			case "APPROVED":
				return "green";
			case "PENDING":
				return "orange";
			case "REJECTED":
				return "red";
			default:
				return "default";
		}
	};

	const getApprovalStatusText = (
		status: "PENDING" | "APPROVED" | "REJECTED"
	) => {
		switch (status) {
			case "APPROVED":
				return "Đã duyệt";
			case "PENDING":
				return "Chờ duyệt";
			case "REJECTED":
				return "Từ chối";
			default:
				return status;
		}
	};

	return (
		<Card
			className={clsx("h-full hover:shadow-lg transition-shadow", className)}
			actions={[
				<Tooltip key="detail" title="Chi tiết">
					<Button
						type="text"
						icon={<InfoCircleOutlined />}
						onClick={handleDetail}
						className="w-full"
					>
						<span className="truncate block">Chi tiết</span>
					</Button>
				</Tooltip>,
				<Tooltip key="view" title="Xem">
					<Button
						type="text"
						icon={<EyeOutlined />}
						onClick={() => onView?.(resource)}
						disabled={!canViewOrDownload()}
						className="w-full"
					>
						<span className="truncate block">Xem</span>
					</Button>
				</Tooltip>,
				<Tooltip key="download" title="Tải xuống">
					<Button
						type="text"
						icon={<DownloadOutlined />}
						onClick={() => onDownload?.(resource)}
						disabled={!canViewOrDownload()}
						className="w-full"
					>
						<span className="truncate block">Tải xuống</span>
					</Button>
				</Tooltip>,
			]}
		>
			<div className="space-y-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
							{resource.title}
						</h3>
						{/* Always render description container to maintain consistent spacing */}
						<p className="text-sm text-gray-600 line-clamp-2 mb-2 min-h-10">
							{resource.description || "\u00A0"}
						</p>
					</div>
					<FileTextOutlined className="text-2xl text-gray-400 ml-2" />
				</div>

				<div className="flex flex-wrap gap-2">
					{resource.course?.title && (
						<Tag color="purple">Học phần: {resource.course.title}</Tag>
					)}
					{resource.type && <Tag color="blue">Loại: {resource.type.name}</Tag>}
					<Tag color={getApprovalStatusColor(resource.approvalStatus)}>
						{getApprovalStatusText(resource.approvalStatus)}
					</Tag>
				</div>

				<div className="space-y-1 text-sm text-gray-600">
					{/* Always render uploadedBy container to maintain consistent spacing */}
					<div className="flex items-center gap-1 min-h-6">
						{resource.uploadedBy ? (
							<>
								<UserOutlined />
								<span>{resource.uploadedBy.fullName}</span>
							</>
						) : (
							<span className="invisible">
								<UserOutlined />
								<span>placeholder</span>
							</span>
						)}
					</div>

					{/* Always render stats container to maintain consistent spacing */}
					<div className="flex items-center gap-4 min-h-6">
						{resource.stats ? (
							<>
								<span>
									<EyeOutlined className="mr-1" />
									{resource.stats.views || 0} lượt xem
								</span>
								<span>
									<DownloadOutlined className="mr-1" />
									{resource.stats.downloads || 0} lượt tải
								</span>
							</>
						) : (
							<span className="invisible">
								<EyeOutlined className="mr-1" />0 lượt xem
							</span>
						)}
					</div>

					{/* Always render size container to maintain consistent spacing */}
					<div className="min-h-6">
						{resource.sizeBytes ? (
							<>
								<span className="font-medium">Kích thước: </span>
								{formatFileSize(resource.sizeBytes)}
							</>
						) : (
							<span className="invisible">
								<span className="font-medium">Kích thước: </span>0 B
							</span>
						)}
					</div>

					{/* Always render createdAt container to maintain consistent spacing */}
					<div className="min-h-6">
						{resource.createdAt ? (
							<>
								<span className="font-medium">Ngày tải lên: </span>
								{dayjs(resource.createdAt).format("DD/MM/YYYY HH:mm")}
							</>
						) : (
							<span className="invisible">
								<span className="font-medium">Ngày tải lên: </span>
								01/01/2024 00:00
							</span>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
};
