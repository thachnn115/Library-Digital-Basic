import { useState } from "react";
import { Tabs, Card } from "antd";
import {
	UploadOutlined,
	EyeOutlined,
	DownloadOutlined,
} from "@ant-design/icons";
import { MyUploads } from "@/components/modules/profile/MyUploads";
import { RecentViews } from "@/components/modules/profile/RecentViews";
import { RecentDownloads } from "@/components/modules/profile/RecentDownloads";
import { ResourceViewer } from "@/components/modules/resource/ResourceViewer";
import type { Resource } from "@/types/resource.types";

type TabKey = "uploads" | "views" | "downloads";

/**
 * My Resources Page - Display user's resources with tabs
 */
const MyResourcesPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabKey>("uploads");
	const [selectedResource, setSelectedResource] = useState<Resource | null>(
		null
	);
	const [viewerOpen, setViewerOpen] = useState(false);

	const handleView = (resource: Resource) => {
		setSelectedResource(resource);
		setViewerOpen(true);
	};

	const handleCloseViewer = () => {
		setViewerOpen(false);
		setSelectedResource(null);
	};

	const tabItems = [
		{
			key: "uploads",
			label: (
				<span>
					<UploadOutlined className="mr-2" />
					Đã tải lên
				</span>
			),
			children: <MyUploads onView={handleView} />,
		},
		{
			key: "views",
			label: (
				<span>
					<EyeOutlined className="mr-2" />
					Đã xem
				</span>
			),
			children: <RecentViews onView={handleView} />,
		},
		{
			key: "downloads",
			label: (
				<span>
					<DownloadOutlined className="mr-2" />
					Đã tải xuống
				</span>
			),
			children: <RecentDownloads onView={handleView} />,
		},
	];

	return (
		<div className="container mx-auto px-4 py-6">
			<Card>
				<h1 className="text-2xl font-bold mb-6">Học liệu của tôi</h1>
				<Tabs
					activeKey={activeTab}
					onChange={(key) => setActiveTab(key as TabKey)}
					items={tabItems}
					size="large"
				/>
			</Card>

			<ResourceViewer
				resource={selectedResource}
				open={viewerOpen}
				onClose={handleCloseViewer}
			/>
		</div>
	);
};

export default MyResourcesPage;
