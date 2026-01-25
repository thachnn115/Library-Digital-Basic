import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button, Input, Form, Card } from "antd";
import { LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { authApi } from "@/api/auth.api";
import { z } from "zod";
import { toast } from "sonner";

const resetPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(8, "Mật khẩu phải có ít nhất 8 ký tự")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Mật khẩu phải chứa chữ hoa, chữ thường và số"
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
		path: ["confirmPassword"],
	});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Reset Password Page
 */
const ResetPasswordPage: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const tokenParam = searchParams.get("token");
		if (!tokenParam) {
			toast.error("Token không hợp lệ. Vui lòng kiểm tra lại link.");
			navigate("/forgot-password");
		} else {
			setToken(tokenParam);
		}
	}, [searchParams, navigate]);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
	});

	const onSubmit = async (data: ResetPasswordFormData) => {
		if (!token) {
			toast.error("Token không hợp lệ");
			return;
		}

		setIsSubmitting(true);
		try {
			await authApi.resetPassword({
				token,
				newPassword: data.newPassword,
			});
			toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
			// Navigate to login after 2 seconds
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				"Đặt lại mật khẩu thất bại. Token có thể đã hết hạn. Vui lòng thử lại.";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!token) {
		return null;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="w-full max-w-md p-8">
				<Card className="shadow-xl">
					<div className="text-center mb-6">
						<h1 className="text-2xl font-bold text-gray-800 mb-2">
							Đặt lại mật khẩu
						</h1>
						<p className="text-gray-600">Nhập mật khẩu mới của bạn</p>
					</div>

					<Form onFinish={handleSubmit(onSubmit)} layout="vertical">
						<Form.Item
							label="Mật khẩu mới"
							validateStatus={errors.newPassword ? "error" : ""}
							help={errors.newPassword?.message}
						>
							<Controller
								name="newPassword"
								control={control}
								render={({ field }) => (
									<Input.Password
										{...field}
										prefix={<LockOutlined />}
										placeholder="Nhập mật khẩu mới"
										size="large"
										disabled={isSubmitting}
										autoComplete="new-password"
									/>
								)}
							/>
						</Form.Item>

						<Form.Item
							label="Xác nhận mật khẩu"
							validateStatus={errors.confirmPassword ? "error" : ""}
							help={errors.confirmPassword?.message}
						>
							<Controller
								name="confirmPassword"
								control={control}
								render={({ field }) => (
									<Input.Password
										{...field}
										prefix={<LockOutlined />}
										placeholder="Nhập lại mật khẩu mới"
										size="large"
										disabled={isSubmitting}
										autoComplete="new-password"
									/>
								)}
							/>
						</Form.Item>

						<Form.Item>
							<Button
								type="primary"
								htmlType="submit"
								size="large"
								block
								loading={isSubmitting}
							>
								Đặt lại mật khẩu
							</Button>
						</Form.Item>

						<div className="text-center mt-4">
							<Link
								to="/login"
								className="text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2"
							>
								<ArrowLeftOutlined />
								Quay lại đăng nhập
							</Link>
						</div>
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default ResetPasswordPage;
