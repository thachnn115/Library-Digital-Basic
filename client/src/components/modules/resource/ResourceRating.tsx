import { useState } from "react";
import { Card, Rate, Button, Space, message, Popconfirm } from "antd";
import { StarOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ratingApi } from "@/api/rating.api";
import { resourceApi } from "@/api/resource.api";
import { useAuth } from "@/hooks/useAuth";
import type { CreateRatingRequest } from "@/types/rating.types";
import { toast } from "sonner";

interface ResourceRatingProps {
	resourceId: string;
	resourceApproved?: boolean;
}

/**
 * Resource Rating Component
 */
export const ResourceRating: React.FC<ResourceRatingProps> = ({
	resourceId,
	resourceApproved = true,
}) => {
	const { user } = useAuth();
	const [ratingValue, setRatingValue] = useState<number>(0);
	const [userRating, setUserRating] = useState<number | null>(null);
	const [userRatingId, setUserRatingId] = useState<number | null>(null);

	const queryClient = useQueryClient();

	// Get ratings data from resource detail endpoint instead of separate rating API
	// Backend returns ratingCount and ratingAverage in ResourceResponse.stats
	// This avoids the 500 error from GET /rating?resourceId=... which doesn't exist
	const { data: resource, isLoading: isLoadingResource } = useQuery({
		queryKey: ["resource", resourceId],
		queryFn: () => resourceApi.getById(resourceId),
		enabled: resourceApproved,
	});

	const isLoading = isLoadingResource;
	
	// Get average rating and count from resource stats
	const averageRating = resource?.stats?.ratingAverage || 0;
	const ratingCount = resource?.stats?.ratingCount || 0;

	const createMutation = useMutation({
		mutationFn: (data: CreateRatingRequest) => ratingApi.create(data),
		onSuccess: (response) => {
			// Invalidate resource query to refetch rating stats
			queryClient.invalidateQueries({ queryKey: ["resource", resourceId] });
			// Save user's rating from response
			if (response && response.id) {
				setUserRating(response.rating);
				setUserRatingId(response.id);
				setRatingValue(response.rating);
			}
			toast.success("Đánh giá thành công!");
		},
		onError: () => {
			toast.error("Đánh giá thất bại. Vui lòng thử lại.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, rating }: { id: number; rating: number }) =>
			ratingApi.update(id, { rating }),
		onSuccess: (response) => {
			// Invalidate resource query to refetch rating stats
			queryClient.invalidateQueries({ queryKey: ["resource", resourceId] });
			// Update user's rating from response
			if (response && response.rating) {
				setUserRating(response.rating);
				setRatingValue(response.rating);
			}
			toast.success("Cập nhật đánh giá thành công!");
		},
		onError: () => {
			toast.error("Cập nhật đánh giá thất bại. Vui lòng thử lại.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => ratingApi.delete(id),
		onSuccess: () => {
			// Invalidate resource query to refetch rating stats
			queryClient.invalidateQueries({ queryKey: ["resource", resourceId] });
			setUserRating(null);
			setUserRatingId(null);
			setRatingValue(0);
			toast.success("Xóa đánh giá thành công!");
		},
		onError: () => {
			toast.error("Xóa đánh giá thất bại. Vui lòng thử lại.");
		},
	});

	const handleRateChange = (value: number) => {
		setRatingValue(value);
	};

	const handleSubmit = () => {
		if (ratingValue === 0) {
			message.warning("Vui lòng chọn số sao");
			return;
		}

		if (userRatingId) {
			// Update existing rating
			updateMutation.mutate({ id: userRatingId, rating: ratingValue });
		} else {
			// Create new rating
			createMutation.mutate({
				resourceId,
				rating: ratingValue,
			});
		}
	};

	const handleDelete = () => {
		if (userRatingId) {
			deleteMutation.mutate(userRatingId);
		}
	};

	if (!resourceApproved) {
		return (
			<Card title="Đánh giá">
				<p className="text-gray-500">Học liệu chưa được duyệt, không thể đánh giá.</p>
			</Card>
		);
	}

	return (
		<Card title="Đánh giá">
			{isLoading ? (
				<div className="text-center py-4">Đang tải...</div>
			) : (
				<div className="space-y-4">
					{/* Average Rating Display */}
					<div className="flex items-center gap-4">
						<div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
						<div>
							<Rate disabled value={averageRating} allowHalf />
							<div className="text-sm text-gray-500 mt-1">
								{ratingCount} đánh giá
							</div>
						</div>
					</div>

					{/* User Rating */}
					{user && (
						<div className="border-t pt-4">
							<div className="mb-2">
								<span className="font-semibold">
									{userRating ? "Đánh giá của bạn" : "Đánh giá học liệu"}
								</span>
							</div>
							<Rate
								value={ratingValue}
								onChange={handleRateChange}
								allowClear={!userRating}
							/>
							<div className="mt-2">
								<Space>
									<Button
										type="primary"
										size="small"
										onClick={handleSubmit}
										loading={createMutation.isPending || updateMutation.isPending}
										icon={userRating ? <EditOutlined /> : <StarOutlined />}
									>
										{userRating ? "Cập nhật" : "Gửi đánh giá"}
									</Button>
									{userRating && (
										<Popconfirm
											title="Xóa đánh giá"
											description="Bạn có chắc chắn muốn xóa đánh giá này?"
											onConfirm={handleDelete}
											okText="Xóa"
											cancelText="Hủy"
										>
											<Button
												size="small"
												danger
												icon={<DeleteOutlined />}
												loading={deleteMutation.isPending}
											>
												Xóa
											</Button>
										</Popconfirm>
									)}
								</Space>
							</div>
						</div>
					)}
				</div>
			)}
		</Card>
	);
};

