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
	// Use same icon for all folders
	const getDefaultIcon = () => <FolderOutlined />;

	if (folders.length === 0) {
		return (
			<Empty
				description="Chưa có thư mục nào"
				className="py-12"
			/>
		);
	}

	// Limit to 6 folders for 2x3 grid
	const displayFolders = folders.slice(0, 6);

	return (
		<Row gutter={[16, 16]}>
			{displayFolders.map((folder) => (
				<Col key={folder.id} xs={12} sm={8} md={8} lg={8}>
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
				</Col>
			))}
		</Row>
	);
};

