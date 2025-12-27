import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input, Form, Card, message } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { authApi } from "@/api/auth.api";
import { z } from "zod";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
	email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot Password Page
 */
const ForgotPasswordPage: React.FC = () => {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onSubmit = async (data: ForgotPasswordFormData) => {
		setIsSubmitting(true);
		try {
			await authApi.forgotPassword({ email: data.email.trim().toLowerCase() });
			toast.success(
				"Đã gửi link reset mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư."
			);
			// Navigate to login after 2 seconds
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				"Gửi email thất bại. Vui lòng thử lại.";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="w-full max-w-md p-8">
				<Card className="shadow-xl">
					<div className="text-center mb-6">
						<h1 className="text-2xl font-bold text-gray-800 mb-2">
							Quên mật khẩu
						</h1>
						<p className="text-gray-600">
							Nhập email của bạn để nhận link reset mật khẩu
						</p>
					</div>

					<Form onFinish={handleSubmit(onSubmit)} layout="vertical">
						<Form.Item
							label="Email"
							validateStatus={errors.email ? "error" : ""}
							help={errors.email?.message}
						>
							<Controller
								name="email"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										prefix={<MailOutlined />}
										placeholder="Nhập email của bạn"
										size="large"
										disabled={isSubmitting}
										type="email"
										autoComplete="email"
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
								Gửi link reset mật khẩu
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

export default ForgotPasswordPage;
