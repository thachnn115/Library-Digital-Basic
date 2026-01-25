import { useState, useCallback, useMemo } from "react";
import { Upload, message } from "antd";
import type { UploadFile, UploadProps } from "antd";
import type { RcFile } from "antd/es/upload";
import { InboxOutlined } from "@ant-design/icons";
import { APP_CONFIG } from "@/constants/app-config";
import { validateFile } from "@/utils/file.utils";
import clsx from "clsx";

const { Dragger } = Upload;

interface FileUploadProps {
	value?: File | null;
	onChange?: (file: File | null) => void;
	accept?: string;
	maxSize?: number;
	disabled?: boolean;
	className?: string;
}

/**
 * File Upload Component with drag and drop support
 */
export const FileUpload: React.FC<FileUploadProps> = ({
	value,
	onChange,
	accept,
	maxSize = APP_CONFIG.MAX_FILE_SIZE,
	disabled = false,
	className,
}) => {
	const [internalFileList, setInternalFileList] = useState<UploadFile[]>([]);

	// Derive fileList from value prop to avoid cascading renders
	const fileList = useMemo(() => {
		if (value) {
			const file: UploadFile = {
				uid: "-1",
				name: value.name,
				status: "done",
				originFileObj: value as unknown as RcFile,
			};
			return [file];
		}
		// If no value but internalFileList exists, use internalFileList
		return internalFileList;
	}, [value, internalFileList]);

	const handleChange: UploadProps["onChange"] = (info) => {
		const { file } = info;

		// Handle file removal
		if (file.status === "removed") {
			setInternalFileList([]);
			onChange?.(null);
			return;
		}

		// Get the actual file object
		const actualFile = file.originFileObj || (file as unknown as File);

		// Handle file upload/selection
		if (actualFile instanceof File) {
			const validation = validateFile(actualFile);
			if (!validation.valid) {
				message.error(validation.error || "Định dạng file không được hỗ trợ");
				setInternalFileList([]);
				onChange?.(null);
				return;
			}

			if (actualFile.size > maxSize) {
				message.error(
					`Kích thước file vượt quá ${(maxSize / (1024 * 1024)).toFixed(0)}MB`
				);
				setInternalFileList([]);
				onChange?.(null);
				return;
			}

			// Update file list and notify parent
			const uploadFile: UploadFile = {
				uid: file.uid || `-${Date.now()}`,
				name: actualFile.name,
				status: "done",
				originFileObj: actualFile as unknown as RcFile,
			};
			setInternalFileList([uploadFile]);
			onChange?.(actualFile);
		} else if (file.status === "uploading" || file.status === "done") {
			// Show uploading/done state
			setInternalFileList([file]);
		}
	};

	const handleBeforeUpload = useCallback(() => {
		return false; // Prevent auto upload
	}, []);

	const handleRemove = useCallback(() => {
		setInternalFileList([]);
		onChange?.(null);
	}, [onChange]);

	return (
		<div className={clsx("w-full", className)}>
			<Dragger
				fileList={fileList}
				onChange={handleChange}
				beforeUpload={handleBeforeUpload}
				onRemove={handleRemove}
				accept={accept}
				disabled={disabled}
				maxCount={1}
				className={clsx(
					"border-2 border-dashed rounded-lg transition-colors",
					disabled
						? "bg-gray-50 border-gray-200"
						: "bg-gray-50 border-gray-300 hover:border-blue-400"
				)}
			>
				<p className="ant-upload-drag-icon">
					<InboxOutlined className="text-4xl text-gray-400" />
				</p>
				<p className="ant-upload-text text-base font-medium text-gray-700">
					Kéo thả file vào đây hoặc click để chọn file
				</p>
				<p className="ant-upload-hint text-sm text-gray-500 mt-2">
					Hỗ trợ: PDF, Word, PowerPoint, Excel, Images, Video
					<br />
					Kích thước tối đa: {maxSize / (1024 * 1024)}MB
				</p>
			</Dragger>
		</div>
	);
};
