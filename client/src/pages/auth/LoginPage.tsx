import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button, Input, Form } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/utils/validation.utils";

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const { login, isAuthenticated, isLoading } = useAuth();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);

	const onSubmit = async (data: LoginFormData) => {
		// useAuth hook đã xử lý lỗi và hiển thị toast
		await login(data);
	};

	return (
		<div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#A3D5FF] via-blue-100 to-indigo-100">
			{/* Decorative background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
			</div>

			<div className="w-full max-w-md px-6 py-8 relative z-10">
				{/* Login Card */}
				<div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10">
					{/* Logo and Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
							Chào mừng trở lại
						</h1>
						<p className="text-slate-600 text-base">
							Đăng nhập vào hệ thống Quản lý Học liệu Số
						</p>
					</div>

					{/* Login Form */}
					<Form
						onFinish={handleSubmit(onSubmit)}
						layout="vertical"
						size="large"
					>
						<Form.Item
							validateStatus={errors.email ? "error" : ""}
							help={errors.email?.message}
							className="mb-5"
						>
							<Controller
								name="email"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										prefix={<UserOutlined className="text-slate-400" />}
										placeholder="Email"
										disabled={isLoading}
										type="email"
										autoComplete="email"
										className="h-12 rounded-xl border-slate-200 hover:border-[#A3D5FF] focus:border-[#A3D5FF] transition-colors"
									/>
								)}
							/>
						</Form.Item>

						<Form.Item
							validateStatus={errors.password ? "error" : ""}
							help={errors.password?.message}
							className="mb-4"
						>
							<Controller
								name="password"
								control={control}
								render={({ field }) => (
									<Input.Password
										{...field}
										prefix={<LockOutlined className="text-slate-400" />}
										placeholder="Mật khẩu"
										disabled={isLoading}
										autoComplete="current-password"
										className="h-12 rounded-xl border-slate-200 hover:border-[#A3D5FF] focus:border-[#A3D5FF] transition-colors"
									/>
								)}
							/>
						</Form.Item>

						<Button
							type="primary"
							htmlType="submit"
							size="large"
							block
							loading={isLoading}
							className="h-12 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] border-0"
						>
							Đăng nhập
						</Button>
					</Form>

					{/* Footer */}
					<div className="mt-8 pt-6 border-t border-slate-200">
						<div className="text-center">
							<p className="text-xs text-slate-500">
								© {new Date().getFullYear()} Hệ thống Quản lý Học liệu Số
							</p>
							<p className="text-xs text-slate-400 mt-1">Phiên bản 1.0.0</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
