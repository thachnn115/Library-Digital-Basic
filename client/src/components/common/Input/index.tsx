import { Input as AntInput, InputNumber as AntInputNumber } from 'antd';
import type { InputProps as AntInputProps, InputNumberProps as AntInputNumberProps } from 'antd';
import clsx from 'clsx';

export interface InputProps extends AntInputProps {
	className?: string;
}

export interface CustomInputNumberProps extends AntInputNumberProps {
	className?: string;
}

/**
 * Input component wrapper around Ant Design Input
 */
export const Input: React.FC<InputProps> = ({
	className,
	...props
}) => {
	return (
		<AntInput
			className={clsx('', className)}
			{...props}
		/>
	);
};

/**
 * InputNumber component wrapper
 */
export const InputNumber: React.FC<CustomInputNumberProps> = ({
	className,
	...props
}) => {
	return (
		<AntInputNumber
			className={clsx('', className)}
			{...props}
		/>
	);
};

/**
 * TextArea component wrapper
 */
export const TextArea: React.FC<AntInputProps> = ({
	className,
	...props
}) => {
	return (
		<AntInput.TextArea
			className={clsx('', className)}
			{...props}
		/>
	);
};

Input.Number = InputNumber;
Input.TextArea = TextArea;

