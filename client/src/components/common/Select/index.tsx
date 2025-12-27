import { Select as AntSelect } from 'antd';
import type { SelectProps as AntSelectProps } from 'antd';
import clsx from 'clsx';

export interface SelectProps extends AntSelectProps {
	className?: string;
}

/**
 * Select component wrapper around Ant Design Select
 * Provides consistent styling and behavior
 */
export const Select: React.FC<SelectProps> = ({
	className,
	...props
}) => {
	return (
		<AntSelect
			className={clsx('', className)}
			{...props}
		/>
	);
};

