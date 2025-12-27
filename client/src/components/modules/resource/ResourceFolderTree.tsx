import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { FolderNodeResponse } from '@/types/resource.types';
import {
	FolderOutlined,
	FileTextOutlined,
	UserOutlined,
} from '@ant-design/icons';
import clsx from 'clsx';

interface ResourceFolderTreeProps {
	nodes?: FolderNodeResponse[];
	onSelect?: (node: FolderNodeResponse) => void;
	selectedKeys?: string[];
	className?: string;
}

/**
 * Resource Folder Tree Component for browsing folder hierarchy
 */
export const ResourceFolderTree: React.FC<ResourceFolderTreeProps> = ({
	nodes = [],
	onSelect,
	selectedKeys = [],
	className,
}) => {
	const getIcon = (type: string) => {
		switch (type) {
			case 'PROGRAM':
			case 'SPECIALIZATION':
			case 'COURSE':
			case 'CLASSROOM':
				return <FolderOutlined />;
			case 'LECTURER':
				return <UserOutlined />;
			case 'RESOURCE':
				return <FileTextOutlined />;
			default:
				return <FolderOutlined />;
		}
	};

	const convertToTreeData = (
		folderNodes: FolderNodeResponse[] | null | undefined
	): DataNode[] => {
		if (!folderNodes || !Array.isArray(folderNodes)) {
			return [];
		}
		return folderNodes.map((node) => ({
			title: node.name,
			key: node.id,
			icon: getIcon(node.type),
			children: undefined, // Lazy load children when expanded
			data: node,
		}));
	};

	// Ensure nodes is always an array
	const safeNodes = nodes && Array.isArray(nodes) ? nodes : [];
	const treeData = convertToTreeData(safeNodes);

	const handleSelect = (selectedKeys: React.Key[]) => {
		if (selectedKeys.length > 0) {
			const selectedId = selectedKeys[0] as string;
			const selectedNode = safeNodes.find((n) => n.id === selectedId);
			if (selectedNode) {
				onSelect?.(selectedNode);
			}
		}
	};

	return (
		<div className={clsx('w-full', className)}>
			{safeNodes.length === 0 ? (
				<div className="text-center py-8 text-gray-500">
					<p className="text-sm">Không có thư mục nào</p>
				</div>
			) : (
				<Tree
					treeData={treeData}
					selectedKeys={selectedKeys}
					onSelect={handleSelect}
					showIcon
					defaultExpandAll={false}
					className="bg-transparent"
					blockNode
				/>
			)}
		</div>
	);
};

