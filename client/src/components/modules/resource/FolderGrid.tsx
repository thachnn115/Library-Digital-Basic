import { Row, Col, Empty } from 'antd';
import { FolderCard } from './FolderCard';
import { FolderOutlined } from '@ant-design/icons';

export interface FolderItem {
	id: string | number;
	title: string;
	type: 'department' | 'program' | 'resource-type' | 'custom';
	icon?: React.ReactNode;
	onClick?: () => void;
}

interface FolderGridProps {
	folders: FolderItem[];
	onFolderClick?: (folder: FolderItem) => void;
}

/**
 * Folder Grid Component - 2x3 grid layout for folders
 */
export const FolderGrid: React.FC<FolderGridProps> = ({
	folders,
	onFolderClick,
}) => {
	const getDefaultIcon = () => <FolderOutlined />;

	if (folders.length === 0) {
		return (
			<div className="premium-card bg-slate-50/50 border-dashed border-slate-200 py-20 flex flex-col items-center justify-center">
				<Empty
					description={
						<span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
							Hệ thống chưa ghi nhận thư mục nào
						</span>
					}
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
			{folders.map((folder, index) => (
				<div
					key={folder.id}
					className="page-entrance"
					style={{ animationDelay: `${index * 50}ms` }}
				>
					<FolderCard
						title={folder.title}
						icon={folder.icon || getDefaultIcon()}
						onClick={() => {
							if (folder.onClick) {
								folder.onClick();
							}
							onFolderClick?.(folder);
						}}
					/>
				</div>
			))}
		</div>
	);
};

