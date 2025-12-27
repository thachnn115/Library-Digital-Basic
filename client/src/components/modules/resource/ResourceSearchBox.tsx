import { useState, useEffect, useRef } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useDebounce } from '@/hooks/useDebounce';
import { APP_CONFIG } from '@/constants/app-config';
import clsx from 'clsx';

interface ResourceSearchBoxProps {
	value?: string;
	onChange?: (value: string) => void;
	onAdvancedFilterClick?: () => void;
	placeholder?: string;
	className?: string;
}

/**
 * Resource Search Box Component with debounced search
 */
export const ResourceSearchBox: React.FC<ResourceSearchBoxProps> = ({
	value = '',
	onChange,
	onAdvancedFilterClick,
	placeholder = 'Tìm kiếm học liệu...',
	className,
}) => {
	const [searchValue, setSearchValue] = useState(value);
	const debouncedValue = useDebounce(searchValue, APP_CONFIG.SEARCH_DEBOUNCE_MS);
	const lastNotifiedValueRef = useRef<string>(value);
	const prevValueRef = useRef<string>(value);

	// Sync internal state with prop value when it changes from parent (only if parent actually changed)
	useEffect(() => {
		if (value !== prevValueRef.current) {
			prevValueRef.current = value;
			setSearchValue(value);
			lastNotifiedValueRef.current = value;
		}
	}, [value]);

	// Notify parent when debounced value changes (only if different from last notified value)
	useEffect(() => {
		if (debouncedValue !== lastNotifiedValueRef.current) {
			lastNotifiedValueRef.current = debouncedValue;
			onChange?.(debouncedValue);
		}
	}, [debouncedValue, onChange]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setSearchValue(newValue);
	};

	const handleClear = () => {
		setSearchValue('');
		lastNotifiedValueRef.current = '';
		// Immediately notify parent when clearing
		onChange?.('');
	};

	return (
		<div className={clsx('flex gap-2', className)}>
			<Input
				value={searchValue}
				onChange={handleChange}
				onClear={handleClear}
				placeholder={placeholder}
				suffix={<SearchOutlined className="text-gray-400" />}
				size="large"
				className="flex-1 rounded-full!"
				style={{
					borderColor: '#4f46e5',
					borderWidth: '1px',
				}}
				allowClear
			/>
			{onAdvancedFilterClick && (
				<Button
					icon={<FilterOutlined />}
					size="large"
					onClick={onAdvancedFilterClick}
					type="default"
				>
					Bộ lọc nâng cao
				</Button>
			)}
		</div>
	);
};

