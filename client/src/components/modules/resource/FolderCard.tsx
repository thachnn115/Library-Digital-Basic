import { Card } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import clsx from 'clsx';

interface FolderCardProps {
	title: string;
	icon?: React.ReactNode;
	onClick?: () => void;
	className?: string;
	description?: string;
	count?: number;
}

/**
 * Folder Card Component - Professional square card for folder display
 */
export const FolderCard: React.FC<FolderCardProps> = ({
	title,
	icon,
	onClick,
	className,
	description,
	count,
}) => {
	return (
		<Card
			hoverable
			onClick={onClick}
			className={clsx(
				'aspect-square! flex! flex-col! cursor-pointer! transition-all! duration-300!',
				'hover:shadow-xl! hover:border-blue-500! hover:-translate-y-1!',
				'border-2! border-gray-200! rounded-xl! overflow-hidden!',
				className
			)}
			bodyStyle={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '32px 24px',
				height: '100%',
				background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
			}}
		>
			{/* Icon Container with gradient background */}
			<div className="relative mb-4">
				<div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl opacity-10 blur-xl"></div>
				<div className="relative text-5xl text-blue-600 flex items-center justify-center w-20 h-20 bg-white rounded-xl shadow-md">
					{icon || <FolderOutlined />}
				</div>
			</div>

			{/* Title */}
			<div className="text-center mb-2">
				<h3 className="font-bold text-slate-800 text-base line-clamp-2 leading-tight">
					{title}
				</h3>
			</div>

			{/* Description */}
			{description && (
				<p className="text-xs text-gray-500 text-center line-clamp-2 mb-2">
					{description}
				</p>
			)}

			{/* Count badge */}
			{count !== undefined && (
				<div className="mt-auto pt-2">
					<span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
						{count} mục
					</span>
				</div>
			)}
		</Card>
	);
};

