import { useState } from "react";
import { Modal, Upload, Button, message, Alert } from "antd";
import { UploadOutlined, FileExcelOutlined, DownloadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "@/api/student.api";
import { toast } from "sonner";

const { Dragger } = Upload;

interface StudentImportModalProps {
	open: boolean;
	onCancel: () => void;
	onSuccess?: () => void;
}

/**
 * Student Import Modal Component
 * Import students from Excel file (ADMIN only)
 */
export const StudentImportModal: React.FC<StudentImportModalProps> = ({
	open,
	onCancel,
	onSuccess,
}) => {
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [isDownloading, setIsDownloading] = useState(false);
	const queryClient = useQueryClient();

	const importMutation = useMutation({
		mutationFn: (file: File) => studentApi.importStudents(file),
		onSuccess: (count) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(`Imported ${count} students`);
			setFileList([]);
			onCancel();
			onSuccess?.();
		},
		onError: (error: any) => {
			const errorMessage =
				error?.response?.data?.message || "Student import failed. Please check the Excel file.";
			toast.error(errorMessage);
		},
	});

	const handleChange: UploadProps["onChange"] = (info) => {
		setFileList(info.fileList);
	};

	const handleDownloadTemplate = async () => {
		try {
			setIsDownloading(true);
			const { blob, filename } = await studentApi.downloadImportTemplate();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
			message.success("Template downloaded");
		} catch (error) {
			message.error("Failed to download template");
		} finally {
			setIsDownloading(false);
		}
	};

	const handleUpload = () => {
		if (fileList.length === 0) {
			message.warning("Please choose an Excel file to import");
			return;
		}

		const file = fileList[0].originFileObj;
		if (!file) {
			message.warning("Invalid file");
			return;
		}

		const validExtensions = [".xlsx", ".xls"];
		const fileName = file.name.toLowerCase();
		const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

		if (!isValidExtension) {
			message.error("Only Excel files (.xlsx, .xls) are accepted");
			return;
		}

		importMutation.mutate(file);
	};

	const handleCancel = () => {
		setFileList([]);
		onCancel();
	};

	return (
		<Modal
			title={
				<div className="flex items-center gap-2">
					<FileExcelOutlined />
					<span>Import students from Excel</span>
				</div>
			}
			open={open}
			onCancel={handleCancel}
			footer={[
				<Button key="cancel" onClick={handleCancel}>
					Cancel
				</Button>,
				<Button
					key="import"
					type="primary"
					onClick={handleUpload}
					loading={importMutation.isPending}
					disabled={fileList.length === 0}
				>
					Import
				</Button>,
			]}
			width={600}
		>
			<div className="space-y-4">
				<div className="flex justify-end">
					<Button
						icon={<DownloadOutlined />}
						onClick={handleDownloadTemplate}
						loading={isDownloading}
					>
						Download template
					</Button>
				</div>
				<Alert
					message="Excel format"
					description={
						<div className="mt-2">
							<p className="mb-2">Columns in order:</p>
							<ol className="list-decimal list-inside space-y-1 text-sm">
								<li>email (required)</li>
								<li>password (required)</li>
								<li>fullName</li>
								<li>birthYear (required)</li>
								<li>address</li>
								<li>phone</li>
								<li>classroomCode (required)</li>
								<li>status (ACTIVE/INACTIVE/LOCK)</li>
							</ol>
							<p className="mt-2 text-xs text-gray-500">
								Note: First row is header and will be skipped.
							</p>
							<p className="mt-1 text-xs text-gray-500">
								Identifier auto-format: cohort start year + 4 digits.
							</p>
						</div>
					}
					type="info"
					showIcon
				/>

				<Dragger
					fileList={fileList}
					onChange={handleChange}
					beforeUpload={() => false}
					accept=".xlsx,.xls"
					maxCount={1}
				>
					<p className="ant-upload-drag-icon">
						<UploadOutlined className="text-4xl text-blue-500" />
					</p>
					<p className="ant-upload-text">
						Click or drag Excel file here to upload
					</p>
					<p className="ant-upload-hint">
						Only Excel files (.xlsx, .xls) are supported
					</p>
				</Dragger>

				{fileList.length > 0 && (
					<div className="text-sm text-gray-600">
						<p>
							Selected: <strong>{fileList[0].name}</strong>
						</p>
						{fileList[0].size && (
							<p>
								Size: {(fileList[0].size / 1024).toFixed(2)} KB
							</p>
						)}
					</div>
				)}
			</div>
		</Modal>
	);
};
