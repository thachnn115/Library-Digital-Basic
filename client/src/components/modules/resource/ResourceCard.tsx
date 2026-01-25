import { Button, Tooltip } from "antd";
import {
	EyeOutlined,
	DownloadOutlined,
	FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import type { Resource } from "@/types/resource.types";
import { formatFileSize } from "@/utils/format.utils";
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

	const canViewOrDownload = () => {
		if (user?.type === "ADMIN" || user?.type === "SUB_ADMIN") return true;
		if (user?.type === "LECTURER" && resource.uploadedBy?.id === user.id) return true;
		return resource.approvalStatus === "APPROVED";
	};

	const handleDetail = () => {
		navigate(ROUTES.RESOURCES_DETAIL.replace(":id", resource.id));
	};

	const statusConfig = {
		APPROVED: { color: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", label: "Verified" },
		PENDING: { color: "text-amber-500 bg-amber-500/5 border-amber-500/10", label: "Under Review" },
		REJECTED: { color: "text-rose-500 bg-rose-500/5 border-rose-500/10", label: "Declined" },
	};

	const config = statusConfig[resource.approvalStatus] || { color: "text-slate-400 bg-slate-100", label: resource.approvalStatus };

	return (
		<div className={clsx("premium-card p-6 bg-white hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full", className)}>
			{/* Top Bar - Type & Status */}
			<div className="flex items-center justify-between mb-5">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm shadow-sm group-hover:bg-premium-gradient group-hover:text-white transition-all duration-500">
						<FileTextOutlined />
					</div>
					<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resource.type?.name || "Resource"}</span>
				</div>
				<div className={clsx("px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border", config.color)}>
					{config.label}
				</div>
			</div>

			{/* Title & Description */}
			<div className="flex-1 space-y-3">
				<h3 className="text-sm font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
					{resource.title}
				</h3>
				<p className="text-[11px] font-bold text-slate-400 line-clamp-2 leading-relaxed">
					{resource.description || "Hệ thống chưa ghi nhận mô tả chi tiết cho học liệu này."}
				</p>
			</div>

			{/* Meta Data Hub */}
			<div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
				<div className="flex items-center justify-between text-[10px]">
					<span className="font-black text-slate-400 uppercase tracking-widest">Ownership</span>
					<span className="font-bold text-slate-700 truncate max-w-[120px]">{resource.uploadedBy?.fullName || "System Admin"}</span>
				</div>
				<div className="flex items-center justify-between text-[10px]">
					<span className="font-black text-slate-400 uppercase tracking-widest">Analytics</span>
					<div className="flex gap-3 font-bold text-slate-600">
						<span className="flex items-center gap-1"><EyeOutlined className="text-[10px]" /> {resource.stats?.views || 0}</span>
						<span className="flex items-center gap-1"><DownloadOutlined className="text-[10px]" /> {resource.stats?.downloads || 0}</span>
					</div>
				</div>
				<div className="flex items-center justify-between text-[10px]">
					<span className="font-black text-slate-400 uppercase tracking-widest">Dimension</span>
					<span className="font-bold text-slate-700">{formatFileSize(resource.sizeBytes || 0)}</span>
				</div>
			</div>

			{/* Executive Actions */}
			<div className="mt-6 flex gap-2">
				<Button
					type="text"
					className="flex-1 h-9 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
					onClick={handleDetail}
				>
					Detail
				</Button>
				<div className="flex gap-2">
					<Tooltip title="Instant View">
						<Button
							icon={<EyeOutlined />}
							className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border-0 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 disabled:bg-slate-100 disabled:text-slate-400 shadow-sm"
							onClick={() => onView?.(resource)}
							disabled={!canViewOrDownload()}
						/>
					</Tooltip>
					<Tooltip title="Get Package">
						<Button
							icon={<DownloadOutlined />}
							className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border-0 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30 disabled:bg-slate-100 disabled:text-slate-400 shadow-sm"
							onClick={() => onDownload?.(resource)}
							disabled={!canViewOrDownload()}
						/>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};
