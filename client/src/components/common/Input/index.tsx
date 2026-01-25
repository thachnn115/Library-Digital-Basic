import { Input as AntInput, InputNumber as AntInputNumber } from 'antd';
import type { InputProps as AntInputProps, InputNumberProps as AntInputNumberProps } from 'antd';
import clsx from 'clsx';

type TextAreaProps = React.ComponentProps<typeof AntInput.TextArea>;

export interface InputProps extends AntInputProps {
	className?: string;
}

export interface CustomInputNumberProps extends AntInputNumberProps {
	className?: string;
}

type InputComponent = React.FC<InputProps> & {
	Number: React.FC<CustomInputNumberProps>;
	TextArea: React.FC<TextAreaProps>;
};

/**
 * Input component wrapper around Ant Design Input
 */
export const Input = (({
	className,
	...props
}) => (
	<AntInput
		className={clsx('', className)}
		{...props}
	/>
)) as InputComponent;

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
export const TextArea: React.FC<TextAreaProps> = ({
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

