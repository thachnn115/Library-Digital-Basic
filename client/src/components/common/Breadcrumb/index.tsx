import { Breadcrumb as AntBreadcrumb } from 'antd';
import type { BreadcrumbProps as AntBreadcrumbProps } from 'antd';
import clsx from 'clsx';

export interface BreadcrumbProps extends AntBreadcrumbProps {
	className?: string;
}

/**
 * Breadcrumb component wrapper around Ant Design Breadcrumb
 * Provides consistent styling and behavior
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
	className,
	...props
}) => {
	return (
		<AntBreadcrumb
			className={clsx('', className)}
			{...props}
		/>
	);
};

