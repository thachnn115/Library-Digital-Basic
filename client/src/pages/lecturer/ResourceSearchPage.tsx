import { useState, useMemo } from "react";
import { Select, Button, message } from "antd";
import { ArrowLeftOutlined, FolderOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { resourceApi } from "@/api/resource.api";
import { ResourceSearchBox } from "@/components/modules/resource/ResourceSearchBox";
import { ResourceFilterBar } from "@/components/modules/resource/ResourceFilterBar";
import { ResourceList } from "@/components/modules/resource/ResourceList";
import {
	FolderGrid,
	type FolderItem,
} from "@/components/modules/resource/FolderGrid";
import { ResourceViewer } from "@/components/modules/resource/ResourceViewer";
import type {
	Resource,
	ResourceSearchParams,
	ResourceSortOption,
	ResourceBrowseParams,
	FolderNodeResponse,
} from "@/types/resource.types";
import { downloadFile } from "@/utils/file.utils";

const { Option } = Select;

/**
 * Resource Search Page - Search bar + Filter bar + Sort + Folder grid (2x3)
 */
const ResourceSearchPage: React.FC = () => {
	const [searchKeyword, setSearchKeyword] = useState<string>("");
	const [filters, setFilters] = useState<ResourceSearchParams>({});
	const [sortOption, setSortOption] = useState<ResourceSortOption>("newest");
	const [showFilterBar, setShowFilterBar] = useState<boolean>(false);
	const [browseParams, setBrowseParams] = useState<ResourceBrowseParams>({});
	const [selectedResource, setSelectedResource] = useState<Resource | null>(
		null
	);
	const [viewerOpen, setViewerOpen] = useState<boolean>(false);

	// Logic remains identical (keeping it as requested)
	const { data: browseData } = useQuery({
		queryKey: ["resources", "browse", browseParams],
		queryFn: () => resourceApi.browse(browseParams),
		retry: false,
		refetchOnMount: "always",
	});

	const searchParams: ResourceSearchParams = useMemo(
		() => ({
			courseKeyword: searchKeyword || undefined,
			...filters,
		}),
		[searchKeyword, filters]
	);

	const hasActiveFilters = useMemo(() => {
		const { courseKeyword, ...otherFilters } = filters;
		return Object.values(otherFilters).some(
			(v) =>
				v !== undefined &&
				v !== null &&
				(Array.isArray(v) ? v.length > 0 : v !== "")
		);
	}, [filters]);

	const shouldSearch = searchKeyword.length > 0 || hasActiveFilters;

	const { data: searchFolderData } = useQuery({
		queryKey: ["resources", "search", searchParams],
		queryFn: () => resourceApi.searchFolders(searchParams),
		enabled: shouldSearch,
	});

	const searchFolderItems: FolderItem[] = useMemo(() => {
		if (!searchFolderData?.nodes || !Array.isArray(searchFolderData.nodes)) {
			return [];
		}
		return searchFolderData.nodes.map((node: FolderNodeResponse) => ({
			id: node.id,
			title: node.name,
			type: "custom",
			icon: <FolderOutlined />,
		}));
	}, [searchFolderData]);

	const browseResources = browseData?.resources;
	const sortedBrowseResources = useMemo(() => {
		if (!browseResources || browseResources.length === 0) return [];
		const sorted = [...browseResources];
		switch (sortOption) {
			case "newest": sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
			case "oldest": sorted.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()); break;
			case "downloads": sorted.sort((a, b) => (b.stats?.downloads || 0) - (a.stats?.downloads || 0)); break;
			case "alphabetical": sorted.sort((a, b) => (a.title || "").localeCompare(b.title || "", "vi")); break;
			default: break;
		}
		return sorted;
	}, [browseResources, sortOption]);

	const folderItems: FolderItem[] = useMemo(() => {
		if (!browseData?.nodes || !Array.isArray(browseData.nodes)) return [];
		return browseData.nodes.map((node: FolderNodeResponse) => ({
			id: node.id,
			title: node.name,
			type: node.type === "PROGRAM" ? "program" : "custom",
			icon: <FolderOutlined />,
		}));
	}, [browseData?.nodes]);

	const handleFolderClick = (folder: FolderItem) => {
		const node = browseData?.nodes?.find((n) => n.id === folder.id);
		if (!node) return;
		const newParams: ResourceBrowseParams = { ...browseParams };
		const nodeType = node.type as string;
		if (nodeType === "PROGRAM") {
			newParams.programCode = node.code || node.id;
			delete newParams.specializationCode;
			delete newParams.courseTitle;
		} else if (nodeType === "SPECIALIZATION") {
			newParams.specializationCode = node.code || node.id;
			delete newParams.courseTitle;
		} else if (nodeType === "COURSE" || nodeType === "COURSE_TITLE") {
			newParams.courseTitle = node.id;
		}
		setBrowseParams(newParams);
	};

	const handleBack = () => {
		const newParams: ResourceBrowseParams = { ...browseParams };
		if (newParams.courseTitle) delete newParams.courseTitle;
		else if (newParams.specializationCode) delete newParams.specializationCode;
		else if (newParams.programCode) delete newParams.programCode;
		setBrowseParams(newParams);
	};

	const formattedBreadcrumbs = useMemo(() => {
		const crumbs = browseData?.breadcrumbs || [];
		return crumbs.map(c => ({ ...c, label: c.label }));
	}, [browseData?.breadcrumbs]);

	const handleView = (resource: Resource) => {
		setSelectedResource(resource);
		setViewerOpen(true);
	};

	const handleDownload = async (resource: Resource) => {
		try {
			const blob = await resourceApi.download(resource.id);
			downloadFile(URL.createObjectURL(blob), resource.title || `file-${resource.id}`);
			message.success("Tải xuống thành công!");
		} catch {
			message.error("Lỗi tải xuống.");
		}
	};

	const isRootLevel = !browseParams.programCode && !browseParams.specializationCode && !browseParams.courseTitle;
	const hasResources = browseData?.resources && browseData.resources.length > 0;

	return (
		<div className="space-y-10 page-entrance">
			{/* Executive Discovery Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200/60">
				<div className="flex-1">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
						<span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
						Resource Explorer Center
					</div>
					<h1 className="text-4xl font-black text-slate-800 tracking-tight">
						Trung tâm <span className="text-premium-gradient">Khám phá Học liệu</span>
					</h1>
					<p className="text-slate-500 font-bold text-sm mt-2">
						Hệ thống quản lý tài nguyên số hóa toàn diện với khả năng truy xuất thời gian thực.
					</p>
				</div>
			</div>

			{/* Search Card - Floating Visual Style */}
			<div className="premium-card p-1 md:p-1 relative overflow-hidden bg-slate-900 shadow-blue-900/10">
				<div className="p-8 md:p-12 relative z-10">
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
					<div className="max-w-3xl mx-auto space-y-10">
						<div className="text-center group">
							<h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] mb-3 group-hover:tracking-[0.4em] transition-all">
								Global Query Terminal
							</h2>
							<p className="text-slate-400 text-xs font-bold leading-relaxed opacity-70">
								Duyệt theo cấp bậc chương trình đào tạo hoặc thực hiện truy vấn trực tiếp kho học liệu.
							</p>
						</div>

						<div className="animate-float">
							<ResourceSearchBox
								value={searchKeyword}
								onChange={setSearchKeyword}
								onAdvancedFilterClick={() => setShowFilterBar(!showFilterBar)}
								placeholder="Nhập mã học phần, tên môn học hoặc từ khóa..."
							/>
						</div>

						{showFilterBar && (
							<div className="page-entrance">
								<ResourceFilterBar
									value={filters}
									onChange={setFilters}
									onClear={() => setFilters({})}
									className="mt-4"
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Results & Browse Section */}
			<div className="space-y-8">
				{/* Search Results Display */}
				{shouldSearch && (
					<div className="premium-card p-8 bg-white/40 backdrop-blur-md space-y-8 page-entrance">
						<div className="flex items-center justify-between border-b border-slate-100 pb-6">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
									<FolderOutlined />
								</div>
								<span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
									Search Results Cluster ({searchFolderItems.length})
								</span>
							</div>
						</div>
						{searchFolderItems.length > 0 ? (
							<FolderGrid
								folders={searchFolderItems}
								onFolderClick={(folder) => {
									setBrowseParams({ courseTitle: folder.title });
									setSearchKeyword("");
								}}
							/>
						) : (
							<div className="py-24 text-center">
								<div className="inline-block p-4 rounded-full bg-slate-50 border border-slate-100 mb-4">
									<SearchOutlined className="text-2xl text-slate-200" />
								</div>
								<div className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
									No matches found for current filters
								</div>
							</div>
						)}
					</div>
				)}

				{/* Level/Breadcrumb Browse Navigation */}
				{!shouldSearch && (
					<div className="premium-card p-8 bg-white space-y-10">
						{/* Breadcrumbs Navigation - Premium Polish */}
						<div className="flex flex-wrap items-center justify-between gap-6">
							<div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-slate-50/80 rounded-2xl border border-slate-100/50 flex-1">
								{!isRootLevel && (
									<Button
										type="text"
										icon={<ArrowLeftOutlined />}
										onClick={handleBack}
										className="text-slate-500 hover:text-blue-600 p-0 h-8 w-8 flex items-center justify-center -ml-2 rounded-full hover:bg-white transition-all shadow-xs"
									/>
								)}
								<div className="flex items-center text-xs font-black text-slate-800 uppercase tracking-widest gap-2">
									{isRootLevel ? (
										<span className="text-blue-600">All Programs</span>
									) : formattedBreadcrumbs.map((crumb, idx) => (
										<span key={idx} className="flex items-center gap-3">
											{idx > 0 && <span className="text-slate-200">/</span>}
											<span className={idx === formattedBreadcrumbs.length - 1 ? "text-blue-600" : "text-slate-400"}>
												{crumb.label}
											</span>
										</span>
									))}
								</div>
							</div>

							{hasResources && (
								<div className="flex items-center gap-4">
									<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort:</span>
									<Select
										value={sortOption}
										onChange={setSortOption}
										className="min-w-[180px] premium-select"
										variant="borderless"
										popupClassName="rounded-2xl shadow-2xl border border-slate-100"
									>
										<Option value="newest">Mới cập nhật</Option>
										<Option value="oldest">Cũ nhất</Option>
										<Option value="downloads">Phổ biến nhất</Option>
										<Option value="alphabetical">Tiêu đề A-Z</Option>
									</Select>
								</div>
							)}
						</div>

						{/* Terminal Content Display */}
						{hasResources ? (
							<div className="space-y-6 page-entrance">
								<div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-widest mb-2">
									<span className="w-2 h-2 rounded-full bg-blue-500" />
									Available Assets Container
								</div>
								<div className="premium-card border-slate-100 overflow-hidden shadow-xs">
									<ResourceList
										resources={sortedBrowseResources}
										onView={handleView}
										onDownload={handleDownload}
									/>
								</div>
							</div>
						) : (
							<div className="space-y-8">
								<div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest">
									Sub-Directory Hierarchies
								</div>
								<FolderGrid
									folders={folderItems}
									onFolderClick={handleFolderClick}
								/>
							</div>
						)}
					</div>
				)}
			</div>

			<ResourceViewer
				resource={selectedResource}
				open={viewerOpen}
				onClose={() => {
					setViewerOpen(false);
					setSelectedResource(null);
				}}
			/>
		</div>
	);
};

export default ResourceSearchPage;
