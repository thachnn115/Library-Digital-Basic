import { Spin } from 'antd';
import clsx from 'clsx';

export interface LoadingSpinnerProps {
	size?: 'small' | 'default' | 'large';
	className?: string;
	tip?: string;
	fullScreen?: boolean;
}

/**
 * Loading Spinner component
 * Provides consistent loading states throughout the application
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	size = 'default',
	className,
	tip,
	fullScreen = false,
}) => {
	const spinner = (
		<Spin
			size={size}
			tip={tip}
			className={clsx('', className)}
		/>
	);

	if (fullScreen) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				{spinner}
			</div>
		);
	}

	return spinner;
};

