import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';
import clsx from 'clsx';

export interface ButtonProps extends AntButtonProps {
	className?: string;
}

/**
 * Button component wrapper around Ant Design Button
 * Provides consistent styling and behavior
 */
export const Button: React.FC<ButtonProps> = ({
	className,
	...props
}) => {
	return (
		<AntButton
			className={clsx('', className)}
			{...props}
		/>
	);
};

