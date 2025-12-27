import { useState, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Spin } from 'antd';
import {
	LeftOutlined,
	RightOutlined,
	ZoomInOutlined,
	ZoomOutOutlined,
} from '@ant-design/icons';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import clsx from 'clsx';

// Import PDF.js worker from node_modules (Vite will handle this correctly)
// This ensures the worker is bundled and served correctly
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
	// Use worker from node_modules via Vite (most reliable)
	pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
}

interface PDFViewerProps {
	file: Blob | string;
	className?: string;
	onLoadError?: (error: Error) => void;
}

/**
 * PDF Viewer Component with page navigation and zoom controls
 */
export const PDFViewer: React.FC<PDFViewerProps> = ({
	file,
	className,
	onLoadError,
}) => {
	const [numPages, setNumPages] = useState<number>(0);
	const [pageNumber, setPageNumber] = useState<number>(1);
	const [scale, setScale] = useState<number>(1.0);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	// Memoize PDF.js options to prevent unnecessary reloads
	const pdfOptions = useMemo(() => ({
		cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
		cMapPacked: true,
	}), []);

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
		setNumPages(numPages);
		setLoading(false);
		setError(null);
	};

	const onDocumentLoadError = (error: Error) => {
		setLoading(false);
		setError(error);
		console.error('PDF Document load error:', error);
		onLoadError?.(error);
	};

	const goToPrevPage = () => {
		setPageNumber((prev) => Math.max(1, prev - 1));
	};

	const goToNextPage = () => {
		setPageNumber((prev) => Math.min(numPages, prev + 1));
	};

	const zoomIn = () => {
		setScale((prev) => Math.min(3.0, prev + 0.2));
	};

	const zoomOut = () => {
		setScale((prev) => Math.max(0.5, prev - 0.2));
	};

	return (
		<div className={clsx('flex flex-col h-full', className)}>
			{/* Controls */}
			<div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
				<div className="flex items-center gap-2">
					<Button
						icon={<ZoomOutOutlined />}
						onClick={zoomOut}
						disabled={scale <= 0.5}
						size="small"
					/>
					<span className="text-sm font-medium min-w-[60px] text-center">
						{Math.round(scale * 100)}%
					</span>
					<Button
						icon={<ZoomInOutlined />}
						onClick={zoomIn}
						disabled={scale >= 3.0}
						size="small"
					/>
				</div>

				<div className="flex items-center gap-2">
					<Button
						icon={<LeftOutlined />}
						onClick={goToPrevPage}
						disabled={pageNumber <= 1}
						size="small"
					/>
					<span className="text-sm font-medium min-w-[100px] text-center">
						Trang {pageNumber} / {numPages}
					</span>
					<Button
						icon={<RightOutlined />}
						onClick={goToNextPage}
						disabled={pageNumber >= numPages}
						size="small"
					/>
				</div>
			</div>

			{/* PDF Viewer */}
			<div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center">
				{error ? (
					<div className="flex flex-col items-center justify-center h-full text-red-600">
						<p className="text-lg font-semibold mb-2">Không thể tải PDF</p>
						<p className="text-sm text-gray-600 mb-4">{error.message || 'Đã xảy ra lỗi khi tải file PDF'}</p>
						<p className="text-xs text-gray-500">Vui lòng thử lại hoặc tải xuống file</p>
					</div>
				) : (
					<Document
						file={file}
						onLoadSuccess={onDocumentLoadSuccess}
						onLoadError={onDocumentLoadError}
						loading={
							<div className="flex items-center justify-center h-full">
								<Spin size="large" />
							</div>
						}
						error={
							<div className="flex flex-col items-center justify-center h-full text-red-600">
								<p className="text-lg font-semibold mb-2">Không thể tải PDF</p>
								<p className="text-sm text-gray-600">Vui lòng thử lại hoặc tải xuống file</p>
							</div>
						}
						className="flex justify-center"
						options={pdfOptions}
					>
						{!loading && numPages > 0 && (
							<Page
								pageNumber={pageNumber}
								scale={scale}
								renderTextLayer
								renderAnnotationLayer
								className="shadow-lg"
								onRenderError={(error) => {
									console.error('PDF Page render error:', error);
								}}
							/>
						)}
					</Document>
				)}
			</div>
		</div>
	);
};

