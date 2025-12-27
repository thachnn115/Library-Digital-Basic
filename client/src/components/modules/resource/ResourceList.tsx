import { useState, useMemo } from 'react';
import { Row, Col, Empty, Button, Space } from 'antd';
import {
	AppstoreOutlined,
	UnorderedListOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/api/course.api';
import { ROUTES } from '@/constants/routes';
import type { Resource } from '@/types/resource.types';
import { ResourceCard } from './ResourceCard';
import clsx from 'clsx';

type ViewMode = 'grid' | 'list';

interface ResourceListProps {
	resources: Resource[];
	onView?: (resource: Resource) => void;
	onDownload?: (resource: Resource) => void;
	loading?: boolean;
	className?: string;
	showUploadButton?: boolean;
}

/**
 * Resource List Component with grid/list view toggle
 */
export const ResourceList: React.FC<ResourceListProps> = ({
	resources,
	onView,
	onDownload,
	loading = false,
	className,
	showUploadButton = false,
}) => {
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const navigate = useNavigate();

	// Fetch all courses to create courseId -> courseTitle map
	const { data: allCourses = [] } = useQuery({
		queryKey: ['courses', 'all'],
		queryFn: () => courseApi.getAll({}),
	});

	// Create map of courseId -> courseTitle
	const courseTitleMap = useMemo(() => {
		const map = new Map<string, string>();
		allCourses.forEach((course) => {
			if (course.id) {
				const courseId = course.id.toString();
				const courseTitle = course.title || course.name || courseId;
				map.set(courseId, courseTitle);
			}
		});
		return map;
	}, [allCourses]);

	// Enrich resources with course title
	const enrichedResources = useMemo(() => {
		return resources.map((resource) => {
			if (resource.courseId && courseTitleMap.has(resource.courseId)) {
				return {
					...resource,
					course: {
						id: resource.courseId,
						title: courseTitleMap.get(resource.courseId) || '',
					},
				};
			}
			return resource;
		});
	}, [resources, courseTitleMap]);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Đang tải...</p>
				</div>
			</div>
		);
	}

	if (resources.length === 0) {
		return (
			<Empty
				description={
					<div className="space-y-4">
						<p className="text-gray-600">Không tìm thấy học liệu nào</p>
						{showUploadButton && (
							<Button
								type="primary"
								icon={<UploadOutlined />}
								onClick={() => navigate(ROUTES.RESOURCES_UPLOAD)}
							>
								Tải lên học liệu mới
							</Button>
						)}
					</div>
				}
				className="py-12"
			/>
		);
	}

	return (
		<div className={clsx('space-y-4', className)}>
			{/* View Mode Toggle */}
			<div className="flex justify-end">
				<Space>
					<Button
						type={viewMode === 'grid' ? 'primary' : 'default'}
						icon={<AppstoreOutlined />}
						onClick={() => setViewMode('grid')}
					>
						Lưới
					</Button>
					<Button
						type={viewMode === 'list' ? 'primary' : 'default'}
						icon={<UnorderedListOutlined />}
						onClick={() => setViewMode('list')}
					>
						Danh sách
					</Button>
				</Space>
			</div>

			{/* Resource Grid/List */}
			{viewMode === 'grid' ? (
				<Row gutter={[16, 16]}>
					{enrichedResources.map((resource) => (
						<Col key={resource.id} xs={24} sm={12} md={8} lg={6}>
							<ResourceCard
								resource={resource}
								onView={onView}
								onDownload={onDownload}
							/>
						</Col>
					))}
				</Row>
			) : (
				<div className="space-y-3">
					{enrichedResources.map((resource) => (
						<ResourceCard
							key={resource.id}
							resource={resource}
							onView={onView}
							onDownload={onDownload}
							className="w-full"
						/>
					))}
				</div>
			)}
		</div>
	);
};

