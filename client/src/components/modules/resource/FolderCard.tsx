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
	count,
}) => {
	return (
		<div
			onClick={onClick}
			className={clsx(
				"folder-item-premium group flex flex-col items-center gap-4 w-[160px] text-center",
				className
			)}
		>
			<div className="w-16 h-16 rounded-2xl bg-slate-50 text-blue-600 flex items-center justify-center text-3xl group-hover:bg-premium-gradient group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100 group-hover:border-transparent group-hover:scale-110 group-hover:rotate-3">
				{icon || <FolderOutlined />}
			</div>

			<div className="space-y-1">
				<h3 className="text-sm font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
					{title}
				</h3>
				{count !== undefined && (
					<div className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
						{count} Res
					</div>
				)}
			</div>
		</div>
	);
};

