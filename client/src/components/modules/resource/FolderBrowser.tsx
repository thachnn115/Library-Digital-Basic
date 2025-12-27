import { useState, useMemo } from 'react';
import { Layout, Breadcrumb, Card, Select, Space } from 'antd';
import type { ResourceFolderResponse, BreadcrumbItem, ResourceSortOption, FolderNodeResponse } from '@/types/resource.types';
import { ResourceFolderTree } from './ResourceFolderTree';
import { ResourceList } from './ResourceList';
import type { Resource } from '@/types/resource.types';
import clsx from 'clsx';

const { Sider, Content } = Layout;
const { Option } = Select;

interface FolderBrowserProps {
	folderData?: ResourceFolderResponse;
	onNodeSelect?: (nodeId: string, nodeType: string) => void;
	onResourceView?: (resource: Resource) => void;
	onResourceDownload?: (resource: Resource) => void;
	className?: string;
}

/**
 * Folder Browser Component with tree navigation and resource list
 */
export const FolderBrowser: React.FC<FolderBrowserProps> = ({
	folderData,
	onNodeSelect,
	onResourceView,
	onResourceDownload,
	className,
}) => {
	const [selectedNodeId, setSelectedNodeId] = useState<string>('');
	const [sortOption, setSortOption] = useState<ResourceSortOption>('newest');

	const handleNodeSelect = (node: FolderNodeResponse) => {
		setSelectedNodeId(node.id);
		onNodeSelect?.(node.id, node.type);
	};

	// Apply sort to resources
	const sortedResources = useMemo(() => {
		if (!folderData?.resources || folderData.resources.length === 0) {
			return [];
		}

		const sorted = [...folderData.resources];

		switch (sortOption) {
			case 'newest':
				// Mới -> Cũ (mặc định)
				sorted.sort((a, b) => {
					const dateA = new Date(a.createdAt || 0).getTime();
					const dateB = new Date(b.createdAt || 0).getTime();
					return dateB - dateA; // Descending
				});
				break;
			case 'oldest':
				// Cũ -> Mới
				sorted.sort((a, b) => {
					const dateA = new Date(a.createdAt || 0).getTime();
					const dateB = new Date(b.createdAt || 0).getTime();
					return dateA - dateB; // Ascending
				});
				break;
			case 'year':
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
			case 'downloads':
				// Lượt tải
				sorted.sort((a, b) => {
					const downloadsA = a.stats?.downloads || 0;
					const downloadsB = b.stats?.downloads || 0;
					return downloadsB - downloadsA; // Descending
				});
				break;
			case 'alphabetical':
				// Bảng chữ cái
				sorted.sort((a, b) => {
					const titleA = (a.title || '').toLowerCase();
					const titleB = (b.title || '').toLowerCase();
					return titleA.localeCompare(titleB, 'vi'); // Vietnamese locale
				});
				break;
			case 'lecturer':
				// Giảng viên (theo tên)
				sorted.sort((a, b) => {
					const nameA = (a.uploadedBy?.fullName || '').toLowerCase();
					const nameB = (b.uploadedBy?.fullName || '').toLowerCase();
					return nameA.localeCompare(nameB, 'vi'); // Vietnamese locale
				});
				break;
			default:
				break;
		}

		return sorted;
	}, [folderData?.resources, sortOption]);

	return (
		<div className={clsx('w-full', className)}>
			{/* Breadcrumbs */}
			{folderData?.breadcrumbs && folderData.breadcrumbs.length > 0 && (
				<Breadcrumb className="mb-4">
					{folderData.breadcrumbs.map((crumb: BreadcrumbItem, index: number) => (
						<Breadcrumb.Item key={index}>
							{crumb.label}
						</Breadcrumb.Item>
					))}
				</Breadcrumb>
			)}

			<Layout className="bg-white rounded-lg border border-gray-200" style={{ minHeight: '600px' }}>
				{/* Sidebar - Folder Tree */}
				<Sider
					width={320}
					className="bg-gray-50 border-r border-gray-200"
					style={{ minHeight: '600px' }}
				>
					<Card 
						title={<span className="font-semibold text-slate-800">Cây thư mục</span>} 
						className="h-full border-0! shadow-none!"
						bodyStyle={{ padding: '16px' }}
					>
						<ResourceFolderTree
							nodes={folderData?.nodes}
							onSelect={handleNodeSelect}
							selectedKeys={selectedNodeId ? [selectedNodeId] : []}
						/>
					</Card>
				</Sider>

				{/* Content - Resource List */}
				<Content className="p-6 bg-white">
					{folderData?.resources && folderData.resources.length > 0 ? (
						<div className="space-y-4">
							{/* Sort and Count */}
							<div className="flex items-center justify-between pb-4 border-b border-gray-200">
								<p className="text-gray-600">
									Tìm thấy <strong className="text-blue-600">{sortedResources.length}</strong> học liệu
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
								resources={sortedResources}
								onView={onResourceView}
								onDownload={onResourceDownload}
							/>
						</div>
					) : (
						<div className="text-center py-12 text-gray-500">
							<p className="text-lg">Không có học liệu trong thư mục này</p>
							<p className="text-sm mt-2">Vui lòng chọn một thư mục khác từ cây thư mục bên trái</p>
						</div>
					)}
				</Content>
			</Layout>
		</div>
	);
};

