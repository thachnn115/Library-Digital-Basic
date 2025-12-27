import { Drawer, Empty, Spin } from 'antd';
import { FolderCard } from './FolderCard';
import { ResourceList } from './ResourceList';
import type { Resource } from '@/types/resource.types';
import type { FolderItem } from './FolderGrid';

interface FolderDetailDrawerProps {
	open: boolean;
	onClose: () => void;
	folder: FolderItem | null;
	subFolders?: FolderItem[];
	resources?: Resource[];
	loading?: boolean;
	onSubFolderClick?: (folder: FolderItem) => void;
	onResourceView?: (resource: Resource) => void;
	onResourceDownload?: (resource: Resource) => void;
}

/**
 * Folder Detail Drawer - Shows sub-folders and resources when a folder is clicked
 */
export const FolderDetailDrawer: React.FC<FolderDetailDrawerProps> = ({
	open,
	onClose,
	folder,
	subFolders = [],
	resources = [],
	loading = false,
	onSubFolderClick,
	onResourceView,
	onResourceDownload,
}) => {
	return (
		<Drawer
			title={folder ? `Thư mục: ${folder.title}` : 'Chi tiết thư mục'}
			placement="right"
			onClose={onClose}
			open={open}
			width={600}
		>
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<Spin size="large" />
				</div>
			) : (
				<div className="space-y-6">
					{/* Sub-folders */}
					{subFolders.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-4">Thư mục con</h3>
							<div className="grid grid-cols-2 gap-4">
								{subFolders.map((subFolder) => (
									<FolderCard
										key={subFolder.id}
										title={subFolder.title}
										icon={subFolder.icon}
										onClick={() => {
											onSubFolderClick?.(subFolder);
										}}
									/>
								))}
							</div>
						</div>
					)}

					{/* Resources */}
					{resources.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-4">
								Học liệu ({resources.length})
							</h3>
							<ResourceList
								resources={resources}
								onView={onResourceView}
								onDownload={onResourceDownload}
							/>
						</div>
					)}

					{subFolders.length === 0 && resources.length === 0 && (
						<Empty
							description="Thư mục này chưa có nội dung"
							className="py-12"
						/>
					)}
				</div>
			)}
		</Drawer>
	);
};

