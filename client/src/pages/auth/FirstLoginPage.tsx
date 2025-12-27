import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button, Input, Form, Steps, Alert } from "antd";
import {
	LockOutlined,
	SafetyOutlined,
	InfoCircleOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { passwordSchema } from "@/utils/validation.utils";
import { toast } from "sonner";
import apiClient from "@/api/client";

// First login schema (change password + set PIN - PIN is optional for now)
const firstLoginSchema = z
	.object({
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
		pin: z
			.string()
			.optional()
			.refine(
				(val) => !val || val.length === 6,
				"PIN phải có 6 chữ số nếu được nhập"
			)
			.refine((val) => !val || /^[0-9]{6}$/.test(val), "PIN chỉ được chứa số"),
		confirmPin: z.string().optional(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
		path: ["confirmPassword"],
	})
	.refine((data) => !data.pin || data.pin === data.confirmPin, {
		message: "PIN xác nhận không khớp",
		path: ["confirmPin"],
	});

type FirstLoginFormData = z.infer<typeof firstLoginSchema>;

const FirstLoginPage: React.FC = () => {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(0);

	const {
		register,
		handleSubmit,
		formState: { errors },
		getValues,
	} = useForm<FirstLoginFormData>({
		resolver: zodResolver(firstLoginSchema),
	});

	const firstLoginMutation = useMutation({
		mutationFn: async (data: FirstLoginFormData) => {
			// API endpoint for first login password change
			// Note: PIN feature is under development, only password change is supported
			// For first login, we need to use the change-password endpoint
			// The backend should handle mustChangePassword flag to allow password change without old password
			const response = await apiClient.post("/users/change-password", {
				currentPassword: "", // User needs to enter initial password from admin for first login
				newPassword: data.newPassword,
				confirmPassword: data.confirmPassword,
			});
			// PIN will be implemented in future backend update
			// await apiClient.post('/auth/first-login', {
			//   newPassword: data.newPassword,
			//   pin: data.pin,
			// });
			return response;
		},
		onSuccess: () => {
			toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
			navigate("/login");
		},
		onError: (error) => {
			console.error("First login error:", error);
			const errorMessage =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message ||
				"Không thể hoàn thành thiết lập. Vui lòng thử lại.";
			toast.error(errorMessage);
		},
	});

	const onSubmit = (data: FirstLoginFormData) => {
		firstLoginMutation.mutate(data);
	};

	const steps = [
		{
			title: "Đổi mật khẩu",
			content: (
				<>
					<Form.Item
						label="Mật khẩu mới"
						validateStatus={errors.newPassword ? "error" : ""}
						help={errors.newPassword?.message}
					>
						<Input.Password
							{...register("newPassword")}
							prefix={<LockOutlined />}
							placeholder="Nhập mật khẩu mới"
							size="large"
							disabled={firstLoginMutation.isPending}
						/>
					</Form.Item>

					<Form.Item
						label="Xác nhận mật khẩu"
						validateStatus={errors.confirmPassword ? "error" : ""}
						help={errors.confirmPassword?.message}
					>
						<Input.Password
							{...register("confirmPassword")}
							prefix={<LockOutlined />}
							placeholder="Nhập lại mật khẩu mới"
							size="large"
							disabled={firstLoginMutation.isPending}
						/>
					</Form.Item>

					<div className="mb-4 p-4 bg-blue-50 rounded-lg">
						<p className="text-sm text-gray-700 mb-2 font-semibold">
							Mật khẩu phải:
						</p>
						<ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
							<li>Có ít nhất 8 ký tự</li>
							<li>Chứa ít nhất 1 chữ hoa</li>
							<li>Chứa ít nhất 1 chữ thường</li>
							<li>Chứa ít nhất 1 chữ số</li>
						</ul>
					</div>
				</>
			),
		},
		{
			title: "Thiết lập PIN",
			content: (
				<>
					<Alert
						message="Tính năng đang phát triển"
						description={
							<div className="space-y-2">
								<p>
									Tính năng mã PIN bảo mật đang được phát triển và sẽ sớm được
									tích hợp vào hệ thống.
								</p>
								<p className="text-sm text-gray-600 mt-2">
									Hiện tại bạn chỉ cần đổi mật khẩu. Mã PIN sẽ được yêu cầu
									thiết lập trong các bản cập nhật sau.
								</p>
							</div>
						}
						type="info"
						icon={<InfoCircleOutlined />}
						showIcon
						className="mb-4"
					/>

					<Form.Item
						label="PIN bảo mật (6 chữ số)"
						validateStatus={errors.pin ? "error" : ""}
						help={
							errors.pin?.message ||
							"Tính năng đang phát triển - không bắt buộc"
						}
					>
						<Input.Password
							{...register("pin")}
							prefix={<SafetyOutlined />}
							placeholder="Nhập PIN 6 chữ số (tùy chọn)"
							size="large"
							maxLength={6}
							disabled={true}
							style={{ opacity: 0.6 }}
						/>
					</Form.Item>

					<Form.Item
						label="Xác nhận PIN"
						validateStatus={errors.confirmPin ? "error" : ""}
						help={
							errors.confirmPin?.message ||
							"Tính năng đang phát triển - không bắt buộc"
						}
					>
						<Input.Password
							{...register("confirmPin")}
							prefix={<SafetyOutlined />}
							placeholder="Nhập lại PIN (tùy chọn)"
							size="large"
							maxLength={6}
							disabled={true}
							style={{ opacity: 0.6 }}
						/>
					</Form.Item>

					<div className="mb-4 p-4 bg-blue-50 rounded-lg">
						<p className="text-sm text-gray-700 font-semibold mb-1">
							ℹ️ Thông tin:
						</p>
						<p className="text-sm text-gray-600">
							Bạn có thể bỏ qua bước này và tiếp tục. Mã PIN sẽ được yêu cầu
							thiết lập khi tính năng được kích hoạt.
						</p>
					</div>
				</>
			),
		},
	];

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
			<div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-xl">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">
						Thiết lập lần đầu
					</h1>
					<p className="text-gray-600">
						Vui lòng đổi mật khẩu và thiết lập PIN bảo mật
					</p>
				</div>

				<Steps
					current={currentStep}
					className="mb-8"
					items={steps.map((item) => ({ title: item.title }))}
				/>

				<Form onFinish={handleSubmit(onSubmit)} layout="vertical">
					<div className="min-h-[400px]">{steps[currentStep].content}</div>

					<div className="flex gap-4">
						{currentStep > 0 && (
							<Button
								size="large"
								onClick={() => setCurrentStep(currentStep - 1)}
								disabled={firstLoginMutation.isPending}
								className="flex-1"
							>
								Quay lại
							</Button>
						)}

						{currentStep < steps.length - 1 ? (
							<Button
								type="primary"
								size="large"
								onClick={() => {
									// Validate current step before moving forward
									if (currentStep === 0) {
										const password = getValues("newPassword");
										const confirmPassword = getValues("confirmPassword");
										if (
											password &&
											password.length >= 8 &&
											password === confirmPassword
										) {
											setCurrentStep(currentStep + 1);
										} else {
											if (!password || password.length < 8) {
												toast.error("Mật khẩu phải có ít nhất 8 ký tự");
											} else if (password !== confirmPassword) {
												toast.error("Mật khẩu xác nhận không khớp");
											}
										}
									}
								}}
								className="flex-1"
							>
								Tiếp theo
							</Button>
						) : (
							<Button
								type="primary"
								htmlType="submit"
								size="large"
								loading={firstLoginMutation.isPending}
								className="flex-1"
								onClick={(e) => {
									e.preventDefault();
									// Only submit password change, PIN is optional and disabled
									const password = getValues("newPassword");
									const confirmPassword = getValues("confirmPassword");
									if (
										password &&
										confirmPassword &&
										password === confirmPassword
									) {
										handleSubmit(onSubmit)();
									} else {
										toast.error("Vui lòng kiểm tra lại thông tin mật khẩu");
									}
								}}
							>
								Hoàn thành (Bỏ qua PIN)
							</Button>
						)}
					</div>
				</Form>
			</div>
		</div>
	);
};

export default FirstLoginPage;
