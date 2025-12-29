import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button, Input, Form } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { passwordSchema } from "@/utils/validation.utils";
import { toast } from "sonner";
import apiClient from "@/api/client";

// First login schema (change password only)
const firstLoginSchema = z
	.object({
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
		path: ["confirmPassword"],
	});

type FirstLoginFormData = z.infer<typeof firstLoginSchema>;

const FirstLoginPage: React.FC = () => {
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FirstLoginFormData>({
		resolver: zodResolver(firstLoginSchema),
	});

	const firstLoginMutation = useMutation({
		mutationFn: async (data: FirstLoginFormData) => {
			// API endpoint for first login password change
			// The backend should handle mustChangePassword flag to allow password change without old password
			const response = await apiClient.post("/users/change-password", {
				currentPassword: "", // User needs to enter initial password from admin for first login
				newPassword: data.newPassword,
				confirmPassword: data.confirmPassword,
			});
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

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
			<div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-xl">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">
						Thiết lập lần đầu
					</h1>
					<p className="text-gray-600">
						Vui lòng đổi mật khẩu để tiếp tục sử dụng hệ thống
					</p>
				</div>

				<Form onFinish={handleSubmit(onSubmit)} layout="vertical">
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

					<Button
						type="primary"
						htmlType="submit"
						size="large"
						loading={firstLoginMutation.isPending}
						className="w-full"
					>
						Hoàn thành
					</Button>
				</Form>
			</div>
		</div>
	);
};

export default FirstLoginPage;
