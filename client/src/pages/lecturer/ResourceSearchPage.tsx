import { useState, useMemo } from "react";
import { Card, Select, Space, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
	BreadcrumbItem,
} from "@/types/resource.types";
import { downloadFile } from "@/utils/file.utils";
import { message } from "antd";
import { FolderOutlined } from "@ant-design/icons";

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
	const queryClient = useQueryClient();

	// Get folder structure from browse API (LECTURER has access to this)
	// This is for the folder tree below search box
	const { data: browseData } = useQuery({
		queryKey: ["resources", "browse", browseParams],
		queryFn: () => resourceApi.browse(browseParams),
		retry: false,
		refetchOnMount: "always", // Always refetch when component mounts to get latest folder structure
	});

	// Combine search keyword and filters
	const searchParams: ResourceSearchParams = useMemo(
		() => ({
			courseKeyword: searchKeyword || undefined,
			...filters,
		}),
		[searchKeyword, filters]
	);

	// Check if there are any active filters (excluding courseKeyword)
	const hasActiveFilters = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { courseKeyword, ...otherFilters } = filters;
		return Object.values(otherFilters).some(
			(v) =>
				v !== undefined &&
				v !== null &&
				(Array.isArray(v) ? v.length > 0 : v !== "")
		);
	}, [filters]);

	// Search should run if there's a keyword OR active filters
	const shouldSearch = searchKeyword.length > 0 || hasActiveFilters;

	const { data: searchResultsRaw = [], isLoading: isSearching } = useQuery({
		queryKey: ["resources", "search", searchParams],
		queryFn: () => resourceApi.search(searchParams),
		enabled: shouldSearch,
	});

	// Apply sort to search results
	const searchResults = useMemo(() => {
		if (!searchResultsRaw.length) return [];

		const sorted = [...searchResultsRaw];

		switch (sortOption) {
			case "newest":
				// Mới -> Cũ (mặc định)
				sorted.sort((a, b) => {
					const dateA = new Date(a.createdAt || 0).getTime();
					const dateB = new Date(b.createdAt || 0).getTime();
					return dateB - dateA; // Descending
				});
				break;
			case "oldest":
				// Cũ -> Mới
				sorted.sort((a, b) => {
					const dateA = new Date(a.createdAt || 0).getTime();
					const dateB = new Date(b.createdAt || 0).getTime();
					return dateA - dateB; // Ascending
				});
				break;
			case "year":
				// Năm (theo năm của createdAt, mới -> cũ)
				sorted.sort((a, b) => {
					const yearA = new Date(a.createdAt || 0).getFullYear();
					const yearB = new Date(b.createdAt || 0).getFullYear();
					if (yearB !== yearA) {
						return yearB - yearA; // Descending by year
					}
					// Same year, sort by full date (newest first)
					const dateA = new Date(a.createdAt || 0).getTime();
					const dateB = new Date(b.createdAt || 0).getTime();
					return dateB - dateA;
				});
				break;
			case "downloads":
				// Lượt tải
				sorted.sort((a, b) => {
					const downloadsA = a.stats?.downloads || 0;
					const downloadsB = b.stats?.downloads || 0;
					return downloadsB - downloadsA; // Descending
				});
				break;
			case "alphabetical":
				// Bảng chữ cái
				sorted.sort((a, b) => {
					const titleA = (a.title || "").toLowerCase();
					const titleB = (b.title || "").toLowerCase();
					return titleA.localeCompare(titleB, "vi"); // Vietnamese locale
				});
				break;
			case "lecturer":
				// Giảng viên (theo tên)
				sorted.sort((a, b) => {
					const nameA = (a.uploadedBy?.fullName || "").toLowerCase();
					const nameB = (b.uploadedBy?.fullName || "").toLowerCase();
					return nameA.localeCompare(nameB, "vi"); // Vietnamese locale
				});
				break;
			default:
				break;
		}

		return sorted;
	}, [searchResultsRaw, sortOption]);

	// Apply sort to browse resources
	const browseResources = browseData?.resources;
	const sortedBrowseResources = useMemo(() => {
		if (!browseResources || browseResources.length === 0) {
			return [];
		}

		const sorted = [...browseResources];

		switch (sortOption) {
			case "newest":
				sorted.sort((a, b) => {
					const dateA = new Date(a.createdAt || 0).getTime();
					const dateB = new Date(b.createdAt || 0).getTime();
					return dateB - dateA;
				});
				break;
			case "oldest":
				sorted.sort((a, b) => {
					const dateA = new Date(a.createdAt || 0).getTime();
					const dateB = new Date(b.createdAt || 0).getTime();
					return dateA - dateB;
				});
				break;
			case "year":
				sorted.sort((a, b) => {
					const yearA = new Date(a.createdAt || 0).getFullYear();
					const yearB = new Date(b.createdAt || 0).getFullYear();
					if (yearB !== yearA) {
						return yearB - yearA;
					}
					const dateA = new Date(a.createdAt || 0).getTime();
					const dateB = new Date(b.createdAt || 0).getTime();
					return dateB - dateA;
				});
				break;
			case "downloads":
				sorted.sort((a, b) => {
					const downloadsA = a.stats?.downloads || 0;
					const downloadsB = b.stats?.downloads || 0;
					return downloadsB - downloadsA;
				});
				break;
			case "alphabetical":
				sorted.sort((a, b) => {
					const titleA = (a.title || "").toLowerCase();
					const titleB = (b.title || "").toLowerCase();
					return titleA.localeCompare(titleB, "vi");
				});
				break;
			case "lecturer":
				sorted.sort((a, b) => {
					const nameA = (a.uploadedBy?.fullName || "").toLowerCase();
					const nameB = (b.uploadedBy?.fullName || "").toLowerCase();
					return nameA.localeCompare(nameB, "vi");
				});
				break;
			default:
				break;
		}

		return sorted;
	}, [browseResources, sortOption]);

	// Store seen nodes for breadcrumb formatting - collect from all cached queries
	const browseNodes = browseData?.nodes;
	const seenNodes = useMemo(() => {
		const nodeMap = new Map<string, FolderNodeResponse>();

		// Add current nodes
		if (browseNodes && Array.isArray(browseNodes)) {
			browseNodes.forEach((node) => {
				nodeMap.set(node.id, node);
			});
		}

		// Collect nodes from all cached browse queries
		// Get all cached queries that match the pattern ["resources", "browse", ...]
		const queryCache = queryClient.getQueryCache();
		const allQueries = queryCache.getAll();

		allQueries.forEach((query) => {
			const queryKey = query.queryKey;
			if (
				Array.isArray(queryKey) &&
				queryKey.length >= 2 &&
				queryKey[0] === "resources" &&
				queryKey[1] === "browse" &&
				queryKey[2] &&
				typeof queryKey[2] === "object"
			) {
				const cachedData = query.state.data as
					| {
							nodes?: FolderNodeResponse[];
					  }
					| undefined;
				if (cachedData?.nodes && Array.isArray(cachedData.nodes)) {
					cachedData.nodes.forEach((node) => {
						// Only add if not already in map (current nodes take precedence)
						if (!nodeMap.has(node.id)) {
							nodeMap.set(node.id, node);
						}
					});
				}
			}
		});

		return nodeMap;
	}, [browseNodes, queryClient]);

	// Convert browse nodes to folder items for grid display
	const browseNodesForFolders = browseData?.nodes;
	const folderItems: FolderItem[] = useMemo(() => {
		if (!browseNodesForFolders || !Array.isArray(browseNodesForFolders)) {
			return [];
		}
		return browseNodesForFolders.map((node: FolderNodeResponse) => {
			return {
				id: node.id,
				title: node.name,
				type: node.type === "PROGRAM" ? "program" : "custom",
				icon: <FolderOutlined />, // Use same icon for all folders
			};
		});
	}, [browseNodesForFolders]);

	const handleFolderClick = (folder: FolderItem) => {
		// Find the node to get type and code
		const node = browseData?.nodes?.find((n) => n.id === folder.id);
		if (!node) return;

		const newParams: ResourceBrowseParams = { ...browseParams };
		const nodeType = node.type as string;

		if (nodeType === "PROGRAM") {
			// Backend expects programCode (code), not id
			newParams.programCode = node.code || node.id;
			delete newParams.specializationCode;
			delete newParams.courseTitle;
			delete newParams.lecturerId;
			delete newParams.classroomId;
		} else if (nodeType === "SPECIALIZATION") {
			// Backend expects specializationCode (code), not id
			newParams.specializationCode = node.code || node.id;
			delete newParams.courseTitle;
			delete newParams.lecturerId;
			delete newParams.classroomId;
		} else if (nodeType === "COURSE" || nodeType === "COURSE_TITLE") {
			// Backend expects courseTitle (title), node.id is the course title
			newParams.courseTitle = node.id;
			delete newParams.lecturerId;
			delete newParams.classroomId;
		} else if (nodeType === "LECTURER") {
			// Backend expects lecturerId (id)
			newParams.lecturerId = node.id;
			delete newParams.classroomId;
		} else if (nodeType === "CLASSROOM") {
			// Backend expects classroomId (id)
			newParams.classroomId = node.id;
		}

		setBrowseParams(newParams);
	};

	const handleBack = () => {
		// Go back one level by removing the last param
		const newParams: ResourceBrowseParams = { ...browseParams };

		if (newParams.classroomId) {
			delete newParams.classroomId;
		} else if (newParams.lecturerId) {
			delete newParams.lecturerId;
		} else if (newParams.courseTitle) {
			delete newParams.courseTitle;
		} else if (newParams.specializationCode) {
			delete newParams.specializationCode;
		} else if (newParams.programCode) {
			delete newParams.programCode;
		}

		setBrowseParams(newParams);
	};

	// Parse URL from breadcrumb to extract browse params
	const parseBreadcrumbUrl = (url: string): ResourceBrowseParams => {
		const params: ResourceBrowseParams = {};

		if (!url || !url.includes("?")) {
			return params; // Root level
		}

		const queryString = url.split("?")[1];
		const searchParams = new URLSearchParams(queryString);

		if (searchParams.has("programCode")) {
			params.programCode = searchParams.get("programCode") || undefined;
		}
		if (searchParams.has("specializationCode")) {
			params.specializationCode =
				searchParams.get("specializationCode") || undefined;
		}
		if (searchParams.has("courseTitle")) {
			params.courseTitle = searchParams.get("courseTitle") || undefined;
		}
		if (searchParams.has("lecturerId")) {
			params.lecturerId = searchParams.get("lecturerId") || undefined;
		}
		if (searchParams.has("classroomId")) {
			params.classroomId = searchParams.get("classroomId") || undefined;
		}

		return params;
	};

	const handleBreadcrumbClick = (crumb: BreadcrumbItem, index: number) => {
		// Don't navigate if clicking on current level (last item)
		if (index === formattedBreadcrumbs.length - 1) {
			return;
		}

		// Parse URL to get params
		const newParams = parseBreadcrumbUrl(crumb.url);
		setBrowseParams(newParams);
	};

	// Check if we're at root level (no params)
	const isRootLevel =
		!browseParams.programCode &&
		!browseParams.specializationCode &&
		!browseParams.courseTitle &&
		!browseParams.lecturerId &&
		!browseParams.classroomId;

	// Check if we have resources (final level)
	const hasResources = browseData?.resources && browseData.resources.length > 0;

	// Format breadcrumb labels: translate to Vietnamese and replace IDs with names
	const browseBreadcrumbs = browseData?.breadcrumbs;
	const browseNodesForBreadcrumbs = browseData?.nodes;
	const browseResourcesForBreadcrumbs = browseData?.resources;
	const formattedBreadcrumbs = useMemo(() => {
		if (!browseBreadcrumbs || !Array.isArray(browseBreadcrumbs)) {
			return [];
		}

		return browseBreadcrumbs.map((crumb) => {
			let label = crumb.label;

			// Translate English labels to Vietnamese
			if (label.startsWith("Programs")) {
				label = "Chương trình đào tạo";
			} else if (label.startsWith("Program: ")) {
				const programCode = label.replace("Program: ", "");
				// Try to find program name from nodes
				const programNode = browseNodesForBreadcrumbs?.find(
					(n) =>
						n.type === "PROGRAM" &&
						(n.code === programCode || n.id === programCode)
				);
				label = programNode
					? `Chương trình: ${programNode.name}`
					: `Chương trình: ${programCode}`;
			} else if (label.startsWith("Specialization: ")) {
				const specCode = label.replace("Specialization: ", "");
				// Try to find specialization name from nodes
				const specNode = browseNodesForBreadcrumbs?.find(
					(n) =>
						n.type === "SPECIALIZATION" &&
						(n.code === specCode || n.id === specCode)
				);
				label = specNode
					? `Chuyên ngành: ${specNode.name}`
					: `Chuyên ngành: ${specCode}`;
			} else if (label.startsWith("Course: ")) {
				const courseTitle = label.replace("Course: ", "");
				label = `Học phần: ${courseTitle}`;
			} else if (label.startsWith("Lecturer: ")) {
				const lecturerId = label.replace("Lecturer: ", "");
				// Try to find lecturer name from seen nodes (includes current and cached nodes)
				const seenNode = seenNodes.get(lecturerId);
				if (seenNode && seenNode.type === "LECTURER") {
					label = `Giảng viên: ${seenNode.name}`;
				} else {
					// Try to find from current nodes
					const lecturerNode = browseNodesForBreadcrumbs?.find(
						(n) => n.type === "LECTURER" && n.id === lecturerId
					);
					if (lecturerNode) {
						label = `Giảng viên: ${lecturerNode.name}`;
					} else {
						// Try to find from resources (when at resource level)
						const resource = browseResourcesForBreadcrumbs?.find(
							(r) => r.uploadedBy?.id === lecturerId
						);
						if (resource?.uploadedBy?.fullName) {
							label = `Giảng viên: ${resource.uploadedBy.fullName}`;
						} else {
							// Try to find from cache by parsing breadcrumb URL
							const crumbParams = parseBreadcrumbUrl(crumb.url);
							// Build parent params (remove lecturerId to get Course level where Lecturer nodes exist)
							const parentParams: ResourceBrowseParams = {
								programCode: crumbParams.programCode,
								specializationCode: crumbParams.specializationCode,
								courseTitle: crumbParams.courseTitle,
							};
							const cachedData = queryClient.getQueryData<{
								nodes?: FolderNodeResponse[];
								resources?: Resource[];
							}>(["resources", "browse", parentParams]);
							const cachedLecturerNode = cachedData?.nodes?.find(
								(n) => n.type === "LECTURER" && n.id === lecturerId
							);
							if (cachedLecturerNode) {
								label = `Giảng viên: ${cachedLecturerNode.name}`;
							} else {
								// Fallback: keep ID if name not found
								label = `Giảng viên: ${lecturerId}`;
							}
						}
					}
				}
			} else if (label.startsWith("Classroom: ")) {
				const classroomId = label.replace("Classroom: ", "");
				// Try to find classroom name from seen nodes (includes current and cached nodes)
				const seenNode = seenNodes.get(classroomId);
				if (seenNode && seenNode.type === "CLASSROOM") {
					label = `Lớp: ${seenNode.name}`;
				} else {
					// Try to find from current nodes
					const classroomNode = browseNodesForBreadcrumbs?.find(
						(n) => n.type === "CLASSROOM" && n.id === classroomId
					);
					if (classroomNode) {
						label = `Lớp: ${classroomNode.name}`;
					} else {
						// Try to find from cache by parsing breadcrumb URL
						const crumbParams = parseBreadcrumbUrl(crumb.url);
						// Build parent params (remove classroomId to get Lecturer level where Classroom nodes exist)
						const parentParams: ResourceBrowseParams = {
							programCode: crumbParams.programCode,
							specializationCode: crumbParams.specializationCode,
							courseTitle: crumbParams.courseTitle,
							lecturerId: crumbParams.lecturerId,
						};
						const cachedData = queryClient.getQueryData<{
							nodes?: FolderNodeResponse[];
							resources?: Resource[];
						}>(["resources", "browse", parentParams]);
						const cachedClassroomNode = cachedData?.nodes?.find(
							(n) => n.type === "CLASSROOM" && n.id === classroomId
						);
						if (cachedClassroomNode) {
							label = `Lớp: ${cachedClassroomNode.name}`;
						} else {
							// Fallback: keep ID if name not found
							label = `Lớp: ${classroomId}`;
						}
					}
				}
			}

			return {
				...crumb,
				label,
			};
		});
	}, [
		browseBreadcrumbs,
		browseNodesForBreadcrumbs,
		browseResourcesForBreadcrumbs,
		seenNodes,
		queryClient,
	]);

	const handleView = (resource: Resource) => {
		setSelectedResource(resource);
		setViewerOpen(true);
	};

	const handleDownload = async (resource: Resource) => {
		try {
			const blob = await resourceApi.download(resource.id);
			const url = URL.createObjectURL(blob);
			const fileName = resource.title || `resource-${resource.id}`;
			downloadFile(url, fileName);
			message.success("Tải xuống thành công!");
		} catch {
			message.error("Tải xuống thất bại. Vui lòng thử lại.");
		}
	};

	// Show search results if there's a keyword or active filters
	const showSearchResults = shouldSearch;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Tìm kiếm học liệu</h1>
			</div>

			{/* Search Box - Always visible */}
			<Card className="border-0! shadow-none!">
				<div className="text-center mb-6">
					<h2 className="text-xl font-semibold text-slate-800 mb-2">
						Tìm kiếm học liệu
					</h2>
					<p className="text-sm text-gray-600 mt-2">
						Tìm kiếm theo <strong>tên học phần</strong> (không tìm theo tên
						file). Chỉ hiển thị học liệu đã được duyệt.
					</p>
				</div>
				<div className="max-w-2xl mx-auto">
					<ResourceSearchBox
						value={searchKeyword}
						onChange={setSearchKeyword}
						onAdvancedFilterClick={() => setShowFilterBar(!showFilterBar)}
						placeholder="Nhập tên học phần để tìm kiếm..."
					/>
				</div>
			</Card>

			{/* Filter Bar - Collapsible */}
			{showFilterBar && (
				<Card className="mb-4">
					<ResourceFilterBar
						value={filters}
						onChange={(newFilters) => {
							setFilters(newFilters);
						}}
						onClear={() => {
							setFilters({});
						}}
					/>
				</Card>
			)}

			{/* Show search results if searching */}
			{showSearchResults && (
				<Card>
					<div className="mb-4 flex items-center justify-between">
						<div>
							<p className="text-gray-600">
								Tìm thấy <strong>{searchResults.length}</strong> học liệu
							</p>
						</div>
						<Space>
							<span className="text-sm text-gray-600">Sắp xếp:</span>
							<Select
								value={sortOption}
								onChange={setSortOption}
								style={{ width: 220 }}
								size="middle"
							>
								<Option value="newest">Mới → Cũ</Option>
								<Option value="oldest">Cũ → Mới</Option>
								<Option value="year">Năm</Option>
								<Option value="downloads">Lượt tải</Option>
								<Option value="alphabetical">Bảng chữ cái</Option>
								<Option value="lecturer">Giảng viên</Option>
							</Select>
						</Space>
					</div>
					<ResourceList
						resources={searchResults}
						loading={isSearching}
						onView={handleView}
						onDownload={handleDownload}
					/>
				</Card>
			)}

			{/* Folder Grid Browser - Show when not searching */}
			{!showSearchResults && (
				<Card>
					{/* Breadcrumb navigation */}
					{!isRootLevel && (
						<div className="mb-4">
							<Button
								icon={<ArrowLeftOutlined />}
								onClick={handleBack}
								type="text"
								className="mb-2"
							>
								Quay lại
							</Button>
							{formattedBreadcrumbs.length > 0 && (
								<div className="text-sm text-gray-600">
									{formattedBreadcrumbs.map((crumb, index) => {
										const isLast = index === formattedBreadcrumbs.length - 1;
										return (
											<span key={index}>
												{index > 0 && " / "}
												{isLast ? (
													<span className="font-semibold text-slate-800">
														{crumb.label}
													</span>
												) : (
													<button
														type="button"
														onClick={() => handleBreadcrumbClick(crumb, index)}
														className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
													>
														{crumb.label}
													</button>
												)}
											</span>
										);
									})}
								</div>
							)}
						</div>
					)}

					{/* Resources display when available */}
					{hasResources ? (
						<div className="space-y-4">
							{/* Sort and Count */}
							<div className="flex items-center justify-between pb-4 border-b border-gray-200">
								<p className="text-gray-600">
									Tìm thấy{" "}
									<strong className="text-blue-600">
										{sortedBrowseResources.length}
									</strong>{" "}
									học liệu
								</p>
								<Space>
									<span className="text-sm text-gray-600">Sắp xếp:</span>
									<Select
										value={sortOption}
										onChange={setSortOption}
										style={{ width: 220 }}
										size="middle"
									>
										<Option value="newest">Mới → Cũ</Option>
										<Option value="oldest">Cũ → Mới</Option>
										<Option value="year">Năm</Option>
										<Option value="downloads">Lượt tải</Option>
										<Option value="alphabetical">Bảng chữ cái</Option>
										<Option value="lecturer">Giảng viên</Option>
									</Select>
								</Space>
							</div>
							<ResourceList
								resources={sortedBrowseResources}
								onView={handleView}
								onDownload={handleDownload}
							/>
						</div>
					) : (
						/* Only Folder Grid when no resources */
						<div>
							<h3 className="text-lg font-semibold text-slate-800 mb-4">
								{isRootLevel ? "Chương trình đào tạo" : "Thư mục con"}
							</h3>
							{folderItems.length > 0 ? (
								<FolderGrid
									folders={folderItems}
									onFolderClick={handleFolderClick}
								/>
							) : (
								<div className="text-center py-12 text-gray-500">
									<p className="text-lg">Không có thư mục nào</p>
									<p className="text-sm mt-2">Vui lòng chọn một thư mục khác</p>
								</div>
							)}
						</div>
					)}
				</Card>
			)}

			{/* Resource Viewer Modal */}
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
