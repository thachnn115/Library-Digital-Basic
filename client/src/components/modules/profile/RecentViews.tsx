import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { historyApi } from '@/api/history.api';
import { resourceApi } from '@/api/resource.api';
import { ResourceList } from '@/components/modules/resource/ResourceList';
import type { History } from '@/types/history.types';
import type { Resource } from '@/types/resource.types';
import { toast } from 'sonner';

interface RecentViewsProps {
	onView?: (resource: Resource) => void;
}

/**
 * Recent Views Component - Display recently viewed resources
 */
export const RecentViews: React.FC<RecentViewsProps> = ({
	onView,
}) => {
	const {
		data: history = [],
		isLoading,
	} = useQuery({
		queryKey: ['history-views'],
		queryFn: () => historyApi.getViews(),
		refetchOnMount: 'always', // Always refetch when component mounts to get latest data
	});

	// Process history: 
	// 1. Sort by time (newest first)
	// 2. Remove duplicates by resource.id - each file appears only once
	// 3. Show ALL different files that have been viewed, sorted by most recent view time
	const resources: Resource[] = useMemo(() => {
		if (!history || history.length === 0) {
			return [];
		}

		// Step 1: Sort by createdAt (newest first)
		const sortedHistory = [...history].sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return dateB - dateA; // Descending order (newest first)
		});

		// Step 2: Keep only the most recent view for each file (resource.id)
		// This ensures each file appears only once, but we show ALL different files
		const uniqueResources: Resource[] = [];
		const seenResourceIds = new Set<string>();

		for (const item of sortedHistory) {
			const resourceId = item.resource?.id;
			
			if (!resourceId) {
				continue; // Skip if no resource ID
			}
			
			// Only add if this file hasn't been seen before
			// This way we show ALL different files, but each file only appears once (most recent view)
			if (!seenResourceIds.has(resourceId)) {
				seenResourceIds.add(resourceId);
				uniqueResources.push(item.resource);
			}
		}

		// Result: All different files, sorted by most recent view time (newest first)
		return uniqueResources;
	}, [history]);

	const handleView = async (resource: Resource) => {
		try {
			await resourceApi.view(resource.id);
			onView?.(resource);
		} catch (error) {
			console.error('View error:', error);
			toast.error('Không thể xem học liệu. Vui lòng thử lại.');
		}
	};

	const handleDownload = async (resource: Resource) => {
		try {
			const blob = await resourceApi.download(resource.id);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${resource.title}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			toast.success('Tải xuống thành công!');
		} catch (error) {
			console.error('Download error:', error);
			toast.error('Tải xuống thất bại. Vui lòng thử lại.');
		}
	};

	return (
		<div className="space-y-4">
			<ResourceList
				resources={resources}
				loading={isLoading}
				onView={handleView}
				onDownload={handleDownload}
			/>
		</div>
	);
};

