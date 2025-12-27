import { Modal as AntModal } from 'antd';
import type { ModalProps as AntModalProps } from 'antd';
import clsx from 'clsx';

export interface ModalProps extends AntModalProps {
	className?: string;
}

/**
 * Modal component wrapper around Ant Design Modal
 * Provides consistent styling and behavior
 */
export const Modal: React.FC<ModalProps> = ({
	className,
	...props
}) => {
	return (
		<AntModal
			className={clsx('', className)}
			{...props}
		/>
	);
};

