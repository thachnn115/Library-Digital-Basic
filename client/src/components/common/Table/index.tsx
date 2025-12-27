import { Table as AntTable } from 'antd';
import type { TableProps as AntTableProps } from 'antd';
import clsx from 'clsx';

export interface TableProps<T> extends AntTableProps<T> {
	className?: string;
}

/**
 * Table component wrapper around Ant Design Table
 * Provides consistent styling and behavior
 */
export const Table = <T extends Record<string, unknown>>({
	className,
	...props
}: TableProps<T>) => {
	return (
		<AntTable<T>
			className={clsx('', className)}
			{...props}
		/>
	);
};

