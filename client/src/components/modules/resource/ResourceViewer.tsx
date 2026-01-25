import { useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import { DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { resourceApi } from '@/api/resource.api';
import { PDFViewer } from '@/components/common/PDFViewer';
import type { Resource } from '@/types/resource.types';
import { downloadFile } from '@/utils/file.utils';
import clsx from 'clsx';

interface ResourceViewerProps {
	resource: Resource | null;
	open: boolean;
	onClose: () => void;
}

/**
 * Resource Viewer Component for viewing and downloading resources
 */
export const ResourceViewer: React.FC<ResourceViewerProps> = ({
	resource,
	open,
	onClose,
}) => {
	const [fileBlob, setFileBlob] = useState<Blob | null>(null);
	const [fileUrl, setFileUrl] = useState<string>('');
	const [fileType, setFileType] = useState<string>('');

	const viewMutation = useMutation({
		mutationFn: async (id: string) => {
			const blob = await resourceApi.view(id);
			// Convert to ArrayBuffer and create new Blob to ensure no detachment
			// This is the safest way to prevent ArrayBuffer detachment issues
			const arrayBuffer = await blob.arrayBuffer();
			const clonedBlob = new Blob([arrayBuffer], { type: blob.type || 'application/pdf' });
			return { blob: clonedBlob, type: blob.type || '' };
		},
		onSuccess: ({ blob, type }) => {
			// Validate blob
			if (!blob || blob.size === 0) {
				console.error('Invalid blob received:', blob);
				message.error('File không hợp lệ hoặc rỗng.');
				return;
			}

			console.log('View success - Blob:', {
				size: blob.size,
				type: type,
				isBlob: blob instanceof Blob,
			});

			// Store the blob
			setFileBlob(blob);
			setFileType(type);

			// Create blob URL for non-PDF files (iframe fallback)
			const url = URL.createObjectURL(blob);
			setFileUrl(url);
		},
		onError: (error) => {
			console.error('View error:', error);
			message.error('Không thể tải file. Vui lòng thử lại.');
		},
	});

	const downloadMutation = useMutation({
		mutationFn: (id: string) => resourceApi.download(id),
		onSuccess: (blob, resourceId) => {
			const url = URL.createObjectURL(blob);
			// Get extension from fileUrl
			let ext = '';
			if (resource?.fileUrl) {
				const lastDot = resource.fileUrl.lastIndexOf('.');
				if (lastDot > 0) {
					ext = resource.fileUrl.substring(lastDot);
				}
			}
			const fileName = (resource?.title || `resource-${resourceId}`) + ext;
			downloadFile(url, fileName);
			message.success('Tải xuống thành công!');
		},
		onError: () => {
			message.error('Tải xuống thất bại. Vui lòng thử lại.');
		},
	});

	useEffect(() => {
		if (open && resource) {
			// Cleanup previous URL if exists
			if (fileUrl) {
				URL.revokeObjectURL(fileUrl);
				setFileUrl('');
			}
			setFileBlob(null);
			setFileType('');

			// Fetch new resource
			viewMutation.mutate(resource.id);
		}

		// Cleanup function - only revoke URL when component unmounts or modal closes
		return () => {
			// Don't revoke here if modal is still open - let handleClose do it
			// This prevents revoking the URL while PDF.js is still using it
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, resource?.id]);

	const handleDownload = () => {
		if (resource) {
			downloadMutation.mutate(resource.id);
		}
	};

	const handleClose = () => {
		if (fileUrl) {
			URL.revokeObjectURL(fileUrl);
		}
		setFileBlob(null);
		setFileUrl('');
		setFileType('');
		onClose();
	};

	const getFileExtension = (url?: string): string => {
		if (!url) return '';
		const lastDot = url.lastIndexOf('.');
		return lastDot > 0 ? url.substring(lastDot).toLowerCase() : '';
	};

	// Check if file is PDF
	const isPDF = fileType === 'application/pdf' ||
		fileBlob?.type === 'application/pdf' ||
		getFileExtension(resource?.fileUrl) === '.pdf' ||
		resource?.fileUrl?.toLowerCase().endsWith('.pdf') ||
		resource?.type?.name?.toLowerCase().includes('pdf');

	return (
		<Modal
			title={resource?.title || 'Xem học liệu'}
			open={open}
			onCancel={handleClose}
			footer={[
				<Button
					key="download"
					icon={<DownloadOutlined />}
					onClick={handleDownload}
					loading={downloadMutation.isPending}
					type="primary"
				>
					Tải xuống
				</Button>,
				<Button key="close" icon={<CloseOutlined />} onClick={handleClose}>
					Đóng
				</Button>,
			]}
			width="90%"
			style={{ top: 20 }}
			className={clsx('resource-viewer-modal')}
		>
			<div className="h-[calc(100vh-200px)]">
				{viewMutation.isPending ? (
					<div className="flex items-center justify-center h-full">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
							<p className="text-gray-600">Đang tải file...</p>
						</div>
					</div>
				) : viewMutation.isError ? (
					<div className="flex items-center justify-center h-full">
						<div className="text-center">
							<p className="text-red-600 mb-2">Không thể tải file</p>
							<p className="text-sm text-gray-500">
								Vui lòng thử lại hoặc liên hệ quản trị viên
							</p>
						</div>
					</div>
				) : fileBlob && isPDF ? (
					// Use Blob directly - the blob is already cloned to prevent detachment
					// PDF.js can handle Blob objects when they're properly cloned
					<PDFViewer
						file={fileBlob}
						onLoadError={(error) => {
							console.error('PDF load error:', error);
							console.error('File details:', {
								size: fileBlob?.size,
								type: fileBlob?.type,
							});
							message.error('Không thể tải PDF. Vui lòng thử lại hoặc tải xuống file.');
						}}
					/>
				) : fileUrl ? (
					<div className="h-full flex items-center justify-center">
						<iframe
							src={fileUrl}
							className="w-full h-full border-0"
							title={resource?.title}
							onError={() => {
								message.error('Không thể hiển thị file này');
							}}
						/>
					</div>
				) : (
					<div className="flex items-center justify-center h-full text-gray-500">
						<p>Không thể hiển thị file này</p>
					</div>
				)}
			</div>
		</Modal>
	);
};

