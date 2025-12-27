import { useState } from "react";
import { Card, List, Input, Button, Space, Avatar, Popconfirm, message } from "antd";
import { SendOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentApi } from "@/api/comment.api";
import { resourceApi } from "@/api/resource.api";
import { useAuth } from "@/hooks/useAuth";
import type { Comment, CreateCommentRequest } from "@/types/comment.types";
import { toast } from "sonner";
import { getAvatarUrl } from "@/utils/avatar.utils";

const { TextArea } = Input;

interface ResourceCommentsProps {
	resourceId: string;
	resourceApproved?: boolean;
}

/**
 * Resource Comments Component
 */
export const ResourceComments: React.FC<ResourceCommentsProps> = ({
	resourceId,
	resourceApproved = true,
}) => {
	const { user } = useAuth();
	const [newComment, setNewComment] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editContent, setEditContent] = useState("");

	const queryClient = useQueryClient();

	// Get comments from resource detail endpoint instead of separate comment API
	// Backend returns comments in ResourceResponse.stats.comments
	// This avoids the 500 error from GET /comment?resourceId=... which doesn't exist
	const { data: resource, isLoading: isLoadingResource } = useQuery({
		queryKey: ["resource", resourceId],
		queryFn: () => resourceApi.getById(resourceId),
		enabled: resourceApproved,
	});

	// Extract comments from resource stats
	const comments: Comment[] = resource?.stats?.comments || [];
	const isLoading = isLoadingResource;

	const createMutation = useMutation({
		mutationFn: (data: CreateCommentRequest) => commentApi.create(data),
		onSuccess: () => {
			// Invalidate resource query to refetch comments from stats
			queryClient.invalidateQueries({ queryKey: ["resource", resourceId] });
			setNewComment("");
			toast.success("Thêm bình luận thành công!");
		},
		onError: () => {
			toast.error("Thêm bình luận thất bại. Vui lòng thử lại.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, content }: { id: string; content: string }) =>
			commentApi.update(id, { content }),
		onSuccess: () => {
			// Invalidate resource query to refetch comments from stats
			queryClient.invalidateQueries({ queryKey: ["resource", resourceId] });
			setEditingId(null);
			setEditContent("");
			toast.success("Cập nhật bình luận thành công!");
		},
		onError: () => {
			toast.error("Cập nhật bình luận thất bại. Vui lòng thử lại.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => commentApi.delete(id),
		onSuccess: () => {
			// Invalidate resource query to refetch comments from stats
			queryClient.invalidateQueries({ queryKey: ["resource", resourceId] });
			toast.success("Xóa bình luận thành công!");
		},
		onError: () => {
			toast.error("Xóa bình luận thất bại. Vui lòng thử lại.");
		},
	});

	const handleSubmit = () => {
		if (!newComment.trim()) {
			message.warning("Vui lòng nhập nội dung bình luận");
			return;
		}
		createMutation.mutate({
			content: newComment.trim(),
			resourceId,
		});
	};

	const handleEdit = (comment: Comment) => {
		setEditingId(comment.id);
		setEditContent(comment.content);
	};

	const handleUpdate = (id: string) => {
		if (!editContent.trim()) {
			message.warning("Vui lòng nhập nội dung bình luận");
			return;
		}
		updateMutation.mutate({ id, content: editContent.trim() });
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditContent("");
	};

	const isOwner = (comment: Comment) => {
		return user?.id === comment.author?.id;
	};

	if (!resourceApproved) {
		return (
			<Card title="Bình luận">
				<p className="text-gray-500">Học liệu chưa được duyệt, không thể bình luận.</p>
			</Card>
		);
	}

	return (
		<Card title={`Bình luận (${comments.length})`}>
			{/* Comment Form */}
			{user && (
				<div className="mb-6">
					<TextArea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="Viết bình luận..."
						rows={3}
						maxLength={500}
						showCount
					/>
					<Button
						type="primary"
						icon={<SendOutlined />}
						onClick={handleSubmit}
						loading={createMutation.isPending}
						className="mt-2"
					>
						Gửi bình luận
					</Button>
				</div>
			)}

			{/* Comments List */}
			{isLoading ? (
				<div className="text-center py-4">Đang tải...</div>
			) : comments.length === 0 ? (
				<div className="text-center py-4 text-gray-500">Chưa có bình luận nào</div>
			) : (
				<List
					dataSource={comments}
					renderItem={(comment) => (
						<List.Item
							key={comment.id}
							actions={
								isOwner(comment)
									? [
											<Button
												key="edit"
												type="link"
												size="small"
												icon={<EditOutlined />}
												onClick={() => handleEdit(comment)}
											>
												Sửa
											</Button>,
											<Popconfirm
												key="delete"
												title="Xóa bình luận"
												description="Bạn có chắc chắn muốn xóa bình luận này?"
												onConfirm={() => deleteMutation.mutate(comment.id)}
												okText="Xóa"
												cancelText="Hủy"
											>
												<Button
													type="link"
													size="small"
													danger
													icon={<DeleteOutlined />}
													loading={deleteMutation.isPending}
												>
													Xóa
												</Button>
											</Popconfirm>,
									  ]
									: []
							}
						>
							{editingId === comment.id ? (
								<div className="w-full">
									<TextArea
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										rows={3}
										maxLength={500}
										showCount
									/>
									<Space className="mt-2">
										<Button
											type="primary"
											size="small"
											onClick={() => handleUpdate(comment.id)}
											loading={updateMutation.isPending}
										>
											Lưu
										</Button>
										<Button size="small" onClick={handleCancelEdit}>
											Hủy
										</Button>
									</Space>
								</div>
							) : (
								<List.Item.Meta
									avatar={
										<Avatar
											src={getAvatarUrl(comment.author?.avatarUrl)}
											icon={<UserOutlined />}
										/>
									}
									title={
										<div className="flex items-center justify-between">
											<span className="font-semibold">
												{comment.author?.fullName || "Người dùng"}
											</span>
											<span className="text-xs text-gray-500">
												{new Date(comment.createdAt).toLocaleString("vi-VN")}
											</span>
										</div>
									}
									description={comment.content}
								/>
							)}
						</List.Item>
					)}
				/>
			)}
		</Card>
	);
};

