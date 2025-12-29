import { useState } from "react";
import { Modal, Upload, Button, message, Alert } from "antd";
import { UploadOutlined, FileExcelOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user.api";
import { toast } from "sonner";

const { Dragger } = Upload;

interface UserImportModalProps {
	open: boolean;
	onCancel: () => void;
	onSuccess?: () => void;
}

/**
 * User Import Modal Component
 * Import users from Excel file (ADMIN only)
 */
export const UserImportModal: React.FC<UserImportModalProps> = ({
	open,
	onCancel,
	onSuccess,
}) => {
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const queryClient = useQueryClient();

	const importMutation = useMutation({
		mutationFn: (file: File) => userApi.importUsers(file),
		onSuccess: (count) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(`Import thành công ${count} người dùng!`);
			setFileList([]);
			onCancel();
			onSuccess?.();
		},
		onError: (error: any) => {
			const errorMessage =
				error?.response?.data?.message || "Import thất bại. Vui lòng kiểm tra lại file Excel.";
			toast.error(errorMessage);
		},
	});

	const handleChange: UploadProps["onChange"] = (info) => {
		setFileList(info.fileList);
	};

	const handleUpload = () => {
		if (fileList.length === 0) {
			message.warning("Vui lòng chọn file Excel để import");
			return;
		}

		const file = fileList[0].originFileObj;
		if (!file) {
			message.warning("File không hợp lệ");
			return;
		}

		// Validate file type
		const validExtensions = [".xlsx", ".xls"];
		const fileName = file.name.toLowerCase();
		const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

		if (!isValidExtension) {
			message.error("Chỉ chấp nhận file Excel (.xlsx, .xls)");
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
					<span>Import người dùng từ Excel</span>
				</div>
			}
			open={open}
			onCancel={handleCancel}
			footer={[
				<Button key="cancel" onClick={handleCancel}>
					Hủy
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
				<Alert
					message="Định dạng file Excel"
					description={
						<div className="mt-2">
							<p className="mb-2">File Excel phải có các cột sau (theo thứ tự):</p>
							<ol className="list-decimal list-inside space-y-1 text-sm">
								<li>email (bắt buộc)</li>
								<li>password (bắt buộc)</li>
								<li>userIdentifier</li>
								<li>gender (Nam/Nữ/Khác)</li>
								<li>fullName</li>
								<li>userType (ADMIN/SUB_ADMIN/SUB-ADMIN/LECTURER) (bắt buộc)</li>
								<li>departmentName</li>
							</ol>
							<p className="mt-2 text-xs text-gray-500">
								Lưu ý: Hàng đầu tiên là header, sẽ được bỏ qua.
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
					<p className="ant-upload-text">Click hoặc kéo thả file Excel vào đây</p>
					<p className="ant-upload-hint">
						Chỉ chấp nhận file Excel (.xlsx, .xls)
					</p>
				</Dragger>

				{fileList.length > 0 && (
					<div className="text-sm text-gray-600">
						<p>
							Đã chọn: <strong>{fileList[0].name}</strong>
						</p>
						{fileList[0].size && (
							<p>
								Kích thước:{" "}
								{(fileList[0].size / 1024).toFixed(2)} KB
							</p>
						)}
					</div>
				)}
			</div>
		</Modal>
	);
};

