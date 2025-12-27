import { useState, useEffect, useMemo } from "react";
import { Modal, Form, Input, Select, Steps, message, Alert, Layout, Card, Divider } from "antd";
import { FolderOutlined, CheckCircleOutlined, FileTextOutlined, EditOutlined, TagOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resourceApi } from "@/api/resource.api";
import { courseApi } from "@/api/course.api";
import { classroomApi } from "@/api/classroom.api";
import { resourceTypeApi } from "@/api/resource-type.api";
import { FileUpload } from "@/components/common/FileUpload";
import { useAuthStore } from "@/stores/auth.store";
import type { ResourceUploadRequest } from "@/types/resource.types";
import type { Course } from "@/types/department.types";

const { TextArea } = Input;

const uploadSchema = z.object({
	classroomId: z.string().min(1, "Phải chọn lớp"),
	title: z.string().min(1, "Tiêu đề không được để trống"),
	description: z.string().optional(),
	courseId: z.string().min(1, "Phải chọn học phần"),
	resourceTypeId: z.string().min(1, "Phải chọn loại học liệu"),
	file: z.instanceof(File, { message: "Phải chọn file" }),
});

interface ResourceUploadModalProps {
	open: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

/**
 * Resource Upload Modal Component with multi-step form
 */
export const ResourceUploadModal: React.FC<ResourceUploadModalProps> = ({
	open,
	onClose,
	onSuccess,
}) => {
	const [currentStep, setCurrentStep] = useState(0);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const queryClient = useQueryClient();
	const { user } = useAuthStore();

	// Get courses first - will be filtered by instructor for LECTURER
	const { data: allCourses = [], error: coursesError } = useQuery({
		queryKey: ["courses", user?.id, user?.type],
		queryFn: () => courseApi.getAll(),
		retry: false,
		enabled: !!user?.id, // Only fetch if user is logged in
	});

	// For LECTURER: Extract classrooms from courses (since LECTURER can't access GET /classroom)
	// For ADMIN/SUB_ADMIN: Fetch classrooms from API
	const { data: allClassrooms = [] } = useQuery({
		queryKey: ["classrooms"],
		queryFn: () => classroomApi.getAll(),
		enabled: (user?.type === "ADMIN" || user?.type === "SUB_ADMIN") && !!user?.id, // Only fetch for ADMIN/SUB_ADMIN
		retry: false,
		// Silently ignore 403 errors for LECTURER (they shouldn't call this API)
		onError: (error) => {
			// Only log if it's not a 403 (which is expected for LECTURER)
			if (error && typeof error === "object" && "response" in error) {
				const axiosError = error as { response?: { status?: number } };
				if (axiosError.response?.status !== 403) {
					console.error("Failed to fetch classrooms:", error);
				}
			}
		},
	});

	// Extract unique classrooms from courses for LECTURER
	const classroomsFromCourses = useMemo(() => {
		if (user?.type !== "LECTURER" || !allCourses.length) {
			return [];
		}
		const classroomMap = new Map<string, Course["classroom"]>();
		allCourses.forEach((course) => {
			if (course.classroom?.id) {
				const classroomId = course.classroom.id.toString();
				if (!classroomMap.has(classroomId)) {
					classroomMap.set(classroomId, course.classroom);
				}
			}
		});
		return Array.from(classroomMap.values());
	}, [allCourses, user?.type]);

	// Use classrooms from API for ADMIN/SUB_ADMIN, or from courses for LECTURER
	const classrooms =
		user?.type === "LECTURER" ? classroomsFromCourses : allClassrooms;


	const { data: resourceTypes = [] } = useQuery({
		queryKey: ["resource-types"],
		queryFn: () => resourceTypeApi.getAll(),
	});

	const {
		control,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<ResourceUploadRequest & { file: File; classroomId: string }>({
		resolver: zodResolver(uploadSchema),
	});

	const selectedClassroomId = watch("classroomId");
	const selectedCourseId = watch("courseId");
	const selectedClassroom = classrooms.find(
		(c) => c.id.toString() === selectedClassroomId
	);

	// Filter courses by instructor and classroom
	// Backend already filters courses by instructor for LECTURER, but we need to filter by classroom too
	const availableCourses = (allCourses as Course[]).filter((course: Course) => {
		// If there's an error fetching courses, don't filter (will show error message)
		if (coursesError) {
			return false;
		}

		// Backend already filters by instructor for LECTURER, but double-check for safety
		if (user?.type === "LECTURER") {
			// Must be instructor of the course
			if (!user?.id || !course.instructor?.id) {
				return false;
			}

			// Normalize IDs to strings for comparison (trim whitespace)
			const userId = String(user.id).trim();
			const instructorId = String(course.instructor.id).trim();
			const isInstructor = userId === instructorId;

			if (!isInstructor) {
				return false;
			}
		}

		// If classroom is selected, course must belong to that classroom
		if (selectedClassroomId) {
			const courseClassroomId = course.classroom?.id;
			if (!courseClassroomId) {
				return false; // Course must have a classroom
			}
			// Normalize classroom IDs to strings for comparison
			const normalizedCourseClassroomId = String(courseClassroomId).trim();
			const normalizedSelectedClassroomId = String(selectedClassroomId).trim();
			const matchesClassroom =
				normalizedCourseClassroomId === normalizedSelectedClassroomId;

			return matchesClassroom;
		}

		return true;
	});

	const selectedCourse = availableCourses.find(
		(c) => c.id.toString() === selectedCourseId
	);

	// Reset courseId when classroom changes
	useEffect(() => {
		if (selectedClassroomId) {
			setValue("courseId", "", { shouldValidate: false });
		}
	}, [selectedClassroomId, setValue]);

	const uploadMutation = useMutation({
		mutationFn: async (data: ResourceUploadRequest & { file: File }) => {
			const { file, ...uploadData } = data;
			return resourceApi.upload(file, uploadData);
		},
		onSuccess: () => {
			// Invalidate all resource-related queries to ensure UI updates across all pages
			queryClient.invalidateQueries({ queryKey: ["resources"] });
			queryClient.invalidateQueries({ queryKey: ["my-uploads"] });
			queryClient.invalidateQueries({ queryKey: ["history-views"] });
			queryClient.invalidateQueries({ queryKey: ["history-downloads"] });
			message.success("Tải lên học liệu thành công!");
			reset();
			setSelectedFile(null);
			setCurrentStep(0);
			onClose();
			onSuccess?.();
		},
		onError: (error: unknown) => {
			let errorMessage = "Tải lên học liệu thất bại. Vui lòng thử lại.";

			if (error && typeof error === "object" && "response" in error) {
				const axiosError = error as {
					response?: { status?: number; data?: { message?: string } };
				};
				if (axiosError.response?.status === 403) {
					errorMessage =
						"Bạn không có quyền upload vào học phần này. Chỉ có thể upload vào các học phần mà bạn là giảng viên.";
				} else if (axiosError.response?.status === 400) {
					// Bad request - could be file type validation
					const backendMessage = axiosError.response?.data?.message || "";
					if (
						backendMessage.includes("Word") ||
						backendMessage.includes("PowerPoint") ||
						backendMessage.includes("convert")
					) {
						errorMessage =
							"File Word (.doc, .docx) và PowerPoint (.ppt, .pptx) không được phép. Vui lòng chuyển đổi sang PDF trước khi tải lên.";
					} else {
						errorMessage =
							backendMessage ||
							"Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.";
					}
				} else if (axiosError.response?.status === 404) {
					errorMessage =
						"Không tìm thấy học phần hoặc loại học liệu. Vui lòng thử lại.";
				} else if (axiosError.response?.data?.message) {
					errorMessage = axiosError.response.data.message;
				}
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			message.error(errorMessage);
		},
	});

	const handleNext = () => {
		if (currentStep === 1 && selectedFile) {
			setCurrentStep(2);
		} else if (currentStep === 2) {
			handleSubmit((data) => {
				// Remove classroomId from upload data as it's not part of ResourceUploadRequest
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { classroomId, ...uploadData } = data;
				uploadMutation.mutate(uploadData);
			})();
		}
	};

	const handleCancel = () => {
		reset();
		setSelectedFile(null);
		setCurrentStep(0);
		onClose();
	};

	return (
		<Modal
			title="Tải lên học liệu"
			open={open}
			onCancel={handleCancel}
			footer={null}
			width={800}
		>
			<Steps
				current={currentStep}
				className="mb-6"
				items={[
					{ title: "Chọn lớp và học phần" },
					{ title: "Chọn file" },
					{ title: "Thông tin học liệu" },
				]}
			/>

			{currentStep === 0 && (
				<Form layout="vertical">
					<Controller
						name="classroomId"
						control={control}
						render={({ field }) => (
							<Form.Item
								label="Lớp"
								validateStatus={errors.classroomId ? "error" : ""}
								help={errors.classroomId?.message}
							>
								<Select
									{...field}
									placeholder="Chọn lớp (sẽ tự động chọn CTĐT, Chuyên ngành, Khóa)"
									showSearch
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
									options={classrooms.map((classroom) => ({
										value: classroom.id.toString(),
										label: `${classroom.code} - ${classroom.name}${
											classroom.specialization
												? ` (${
														classroom.specialization.department?.name || ""
												  })`
												: ""
										}`,
									}))}
									notFoundContent={
										classrooms.length === 0
											? user?.type === "LECTURER"
												? "Không tìm thấy lớp nào trong khoa của bạn."
												: "Không tìm thấy lớp nào"
											: "Không tìm thấy"
									}
								/>
							</Form.Item>
						)}
					/>

					{selectedClassroom && (
						<Alert
							message="Thông tin lớp đã chọn"
							description={
								<div className="mt-2 space-y-1">
									{selectedClassroom.specialization?.department && (
										<p>
											<strong>Khoa:</strong>{" "}
											{selectedClassroom.specialization.department.name} (
											{selectedClassroom.specialization.department.code})
										</p>
									)}
									{selectedClassroom.specialization?.program && (
										<p>
											<strong>Chương trình đào tạo:</strong>{" "}
											{selectedClassroom.specialization.program.name} (
											{selectedClassroom.specialization.program.code})
										</p>
									)}
									{selectedClassroom.specialization && (
										<p>
											<strong>Chuyên ngành:</strong>{" "}
											{selectedClassroom.specialization.name} (
											{selectedClassroom.specialization.code})
										</p>
									)}
									{selectedClassroom.cohort && (
										<p>
											<strong>Khóa:</strong> {selectedClassroom.cohort.code} (
											{selectedClassroom.cohort.startYear}
											{selectedClassroom.cohort.endYear
												? `-${selectedClassroom.cohort.endYear}`
												: ""}
											)
										</p>
									)}
									{coursesError && (
										<div className="text-red-600 mt-2 space-y-1">
											<p>
												<strong>Lỗi:</strong> Không thể tải danh sách học phần
												(403 Forbidden).
											</p>
											{user?.mustChangePassword && (
												<div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
													<p className="font-semibold text-yellow-800">
														⚠️ Bạn cần đổi mật khẩu trước khi sử dụng hệ thống
													</p>
													<p className="text-sm text-yellow-700 mt-1">
														Vui lòng vào <strong>Hồ sơ</strong> để đổi mật khẩu,
														sau đó đăng xuất và đăng nhập lại.
													</p>
												</div>
											)}
											{!user?.mustChangePassword && (
												<p className="mt-2">
													<strong>Giải pháp:</strong> Vui lòng đăng xuất và đăng
													nhập lại. Nếu vấn đề vẫn tiếp tục, liên hệ quản trị
													viên để kiểm tra xem tài khoản của bạn đã được gán
													đúng role LECTURER chưa.
												</p>
											)}
										</div>
									)}
									{!coursesError &&
										availableCourses.length === 0 &&
										selectedClassroomId && (
											<div className="text-orange-600 mt-2 space-y-1">
												<p>
													<strong>Lưu ý:</strong> Không tìm thấy học phần nào
													trong lớp này mà bạn là giảng viên.
												</p>
												<p className="mt-2">
													Vui lòng kiểm tra lại trong{" "}
													<strong>Quản lý Danh mục</strong> xem học phần đã được
													gán đúng giảng viên chưa.
												</p>
											</div>
										)}
								</div>
							}
							type={coursesError ? "error" : "info"}
							showIcon
							className="mb-4"
						/>
					)}

					<Controller
						name="courseId"
						control={control}
						render={({ field }) => (
							<Form.Item
								label="Học phần"
								validateStatus={errors.courseId ? "error" : ""}
								help={errors.courseId?.message}
							>
								<Select
									{...field}
									placeholder="Chọn học phần"
									showSearch
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
									options={availableCourses.map((course) => ({
										value: course.id.toString(),
										label: `${
											course.title || course.name || course.code || "Học phần"
										}${
											course.instructor
												? ` - GV: ${course.instructor.fullName}`
												: ""
										}`,
									}))}
									disabled={!selectedClassroomId}
									notFoundContent={
										availableCourses.length === 0
											? selectedClassroomId
												? "Không tìm thấy học phần nào trong lớp này mà bạn là giảng viên."
												: "Vui lòng chọn lớp trước"
											: "Không tìm thấy"
									}
								/>
							</Form.Item>
						)}
					/>

					<div className="flex justify-end gap-2 mt-4">
						<button
							type="button"
							onClick={handleCancel}
							className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 bg-white text-gray-700"
							style={{ backgroundColor: 'white', color: '#374151' }}
						>
							Hủy
						</button>
						<button
							type="button"
							onClick={async () => {
								const courseId = watch("courseId");
								if (selectedClassroomId && courseId) {
									setCurrentStep(1);
								} else {
									message.warning("Vui lòng chọn đầy đủ lớp và học phần");
								}
							}}
							disabled={!selectedClassroomId || !watch("courseId")}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
							style={{ backgroundColor: '#2563eb', color: 'white' }}
						>
							Tiếp theo
						</button>
					</div>
				</Form>
			)}

			{currentStep === 1 && (
				<div className="space-y-4">
					<FileUpload
						value={selectedFile}
						onChange={(file) => {
							setSelectedFile(file);
							if (file) {
								setValue("file", file, { shouldValidate: true });
							} else {
								setValue("file", null as unknown as File, {
									shouldValidate: false,
								});
							}
						}}
					/>
					{selectedFile && (
						<div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
							<p className="text-sm text-green-800">
								<strong>File đã chọn:</strong> {selectedFile.name} (
								{(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
							</p>
						</div>
					)}
					<div className="flex justify-end gap-2 mt-4">
						<button
							type="button"
							onClick={() => setCurrentStep(0)}
							className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 bg-white text-gray-700"
							style={{ backgroundColor: 'white', color: '#374151' }}
						>
							Quay lại
						</button>
						<button
							type="button"
							onClick={handleNext}
							disabled={!selectedFile}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
							style={{ backgroundColor: '#2563eb', color: 'white' }}
						>
							Tiếp theo
						</button>
					</div>
				</div>
			)}

			{currentStep === 2 && (
				<Layout style={{ background: "transparent", minHeight: "400px" }}>
					<Layout.Sider
						width={300}
						style={{
							background: "#f5f5f5",
							padding: "16px",
							borderRadius: "8px",
							marginRight: "16px",
						}}
					>
						<div className="space-y-4">
							<h3 className="font-semibold text-lg mb-4">Chọn folder học phần</h3>
							
							{selectedClassroom && (
								<Card size="small" className="mb-4">
									<div className="space-y-2 text-sm">
										{selectedClassroom.specialization?.department && (
											<p>
												<strong>Khoa:</strong>{" "}
												{selectedClassroom.specialization.department.name}
											</p>
										)}
										{selectedClassroom.specialization?.program && (
											<p>
												<strong>CTĐT:</strong>{" "}
												{selectedClassroom.specialization.program.name}
											</p>
										)}
										{selectedClassroom.specialization && (
											<p>
												<strong>Chuyên ngành:</strong>{" "}
												{selectedClassroom.specialization.name}
											</p>
										)}
										{selectedClassroom.cohort && (
											<p>
												<strong>Khóa:</strong> {selectedClassroom.cohort.code}
											</p>
										)}
										<p>
											<strong>Lớp:</strong> {selectedClassroom.name}
										</p>
									</div>
								</Card>
							)}

							<div className="space-y-2">
								<p className="text-sm font-medium text-gray-700 mb-2">
									Danh sách học phần:
								</p>
								{availableCourses.length === 0 ? (
									<p className="text-sm text-gray-500">
										Không có học phần nào
									</p>
								) : (
									<div className="space-y-2">
										{availableCourses.map((course) => {
											const isSelected = course.id.toString() === selectedCourseId;
											return (
												<Card
													key={course.id}
													size="small"
													hoverable
													onClick={() => {
														setValue("courseId", course.id.toString(), {
															shouldValidate: true,
														});
													}}
													style={{
														cursor: "pointer",
														borderColor: isSelected ? "#1890ff" : undefined,
														borderWidth: isSelected ? 2 : 1,
														backgroundColor: isSelected ? "#e6f7ff" : "white",
													}}
													className={isSelected ? "shadow-md" : ""}
												>
													<div className="flex items-start gap-2">
														<FolderOutlined
															className="text-blue-500 mt-1"
															style={{ fontSize: "16px" }}
														/>
														<div className="flex-1 text-sm">
															<div className="flex items-center gap-2">
																<p className="font-medium">
																	{course.title || course.name || course.code || "Học phần"}
																</p>
																{isSelected && (
																	<CheckCircleOutlined
																		className="text-blue-500"
																		style={{ fontSize: "14px" }}
																	/>
																)}
															</div>
															{course.instructor && (
																<p className="text-xs text-gray-500 mt-1">
																	GV: {course.instructor.fullName}
																</p>
															)}
														</div>
													</div>
												</Card>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</Layout.Sider>

					<Layout.Content style={{ background: "transparent" }}>
						<Card
							title={
								<div className="flex items-center gap-2">
									<FileTextOutlined className="text-blue-500" />
									<span className="text-lg font-semibold">Thông tin học liệu</span>
								</div>
							}
							className="shadow-sm"
						>
							<Form
								layout="vertical"
								onFinish={handleSubmit((data) => {
									// Remove classroomId from upload data as it's not part of ResourceUploadRequest
									// eslint-disable-next-line @typescript-eslint/no-unused-vars
									const { classroomId, ...uploadData } = data;
									uploadMutation.mutate(uploadData);
								})}
							>
								{selectedCourse && (
									<Card
										size="small"
										className="mb-6"
										style={{
											backgroundColor: "#f0f9ff",
											borderColor: "#3b82f6",
											borderWidth: 1,
										}}
									>
										<div className="flex items-start gap-3">
											<CheckCircleOutlined className="text-blue-500 text-lg mt-1" />
											<div className="flex-1">
												<p className="text-xs font-medium text-gray-500 mb-1">
													Học phần đã chọn
												</p>
												<p className="font-semibold text-base text-gray-900">
													{selectedCourse.title || selectedCourse.name || selectedCourse.code}
												</p>
												{selectedCourse.instructor && (
													<p className="text-sm text-gray-600 mt-1">
														Giảng viên: <span className="font-medium">{selectedCourse.instructor.fullName}</span>
													</p>
												)}
											</div>
										</div>
									</Card>
								)}

								{!selectedCourse && (
									<Alert
										message="Vui lòng chọn học phần"
										description="Bạn cần chọn một học phần từ danh sách bên trái để tiếp tục."
										type="warning"
										showIcon
										className="mb-6"
									/>
								)}

								<Divider orientation="left" plain>
									<span className="text-sm font-medium text-gray-600">Chi tiết học liệu</span>
								</Divider>

								<Controller
									name="title"
									control={control}
									render={({ field }) => (
										<Form.Item
											label={
												<span className="font-medium">
													<EditOutlined className="mr-2 text-blue-500" />
													Tên học liệu
												</span>
											}
											validateStatus={errors.title ? "error" : ""}
											help={errors.title?.message}
											required
											className="mb-4"
										>
											<Input
												{...field}
												placeholder="Nhập tên học liệu"
												size="large"
												className="rounded-md"
											/>
										</Form.Item>
									)}
								/>

								<Controller
									name="description"
									control={control}
									render={({ field }) => (
										<Form.Item
											label={
												<span className="font-medium">
													<FileTextOutlined className="mr-2 text-blue-500" />
													Mô tả
												</span>
											}
											className="mb-4"
										>
											<TextArea
												{...field}
												rows={4}
												placeholder="Nhập mô tả học liệu (tùy chọn)"
												className="rounded-md"
												showCount
												maxLength={500}
											/>
										</Form.Item>
									)}
								/>

								<Controller
									name="resourceTypeId"
									control={control}
									render={({ field }) => (
										<Form.Item
											label={
												<span className="font-medium">
													<TagOutlined className="mr-2 text-blue-500" />
													Loại học liệu
												</span>
											}
											validateStatus={errors.resourceTypeId ? "error" : ""}
											help={errors.resourceTypeId?.message}
											required
											className="mb-6"
										>
											<Select
												{...field}
												placeholder="Chọn loại học liệu"
												size="large"
												className="rounded-md"
												options={resourceTypes.map((type) => ({
													value: type.id.toString(),
													label: type.name,
												}))}
											/>
										</Form.Item>
									)}
								/>

								<Divider />

								<div className="flex justify-end gap-3 mt-6">
									<button
										type="button"
										onClick={() => setCurrentStep(1)}
										className="px-6 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 bg-white text-gray-700 font-medium transition-colors"
										style={{ backgroundColor: 'white', color: '#374151' }}
									>
										Quay lại
									</button>
									<button
										type="submit"
										disabled={isSubmitting || uploadMutation.isPending || !selectedCourseId}
										className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
										style={{ backgroundColor: '#2563eb', color: 'white' }}
									>
										{uploadMutation.isPending ? "Đang tải lên..." : "Tải lên"}
									</button>
								</div>
							</Form>
						</Card>
					</Layout.Content>
				</Layout>
			)}
		</Modal>
	);
};
