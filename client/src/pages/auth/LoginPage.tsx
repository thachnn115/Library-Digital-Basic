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
		await login(data);
	};

	return (
		<div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8fafc] page-fade-in">
			{/* Professional Mesh Background */}
			<div className="absolute inset-0 z-0">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-slate-100/20 rounded-full blur-[120px]" />
			</div>

			<div className="w-full max-w-[420px] px-6 relative z-10">
				{/* Scientific Compact Login Card */}
				<div className="glass-effect rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 p-8 md:p-10">
					{/* Logo and Header */}
					<div className="text-center mb-8">
						<div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg mx-auto mb-6">
							📚
						</div>
						<h1 className="text-2xl font-bold text-slate-800 tracking-tight">
							Hệ thống Thư viện Số
						</h1>
						<p className="text-slate-500 text-sm mt-2 font-medium">
							Đăng nhập để truy cập kho học liệu
						</p>
					</div>

					{/* Login Form */}
					<Form
						onFinish={handleSubmit(onSubmit)}
						layout="vertical"
						size="large"
						requiredMark={false}
					>
						<Form.Item
							label={<span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</span>}
							validateStatus={errors.email ? "error" : ""}
							help={errors.email?.message}
							className="mb-4"
						>
							<Controller
								name="email"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										prefix={<UserOutlined className="text-slate-400" />}
										placeholder="name@university.edu"
										disabled={isLoading}
										type="email"
										className="h-11 rounded-lg border-slate-200 focus:border-blue-500 hover:border-blue-400 transition-all font-medium text-sm"
									/>
								)}
							/>
						</Form.Item>

						<Form.Item
							label={<span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mật khẩu</span>}
							validateStatus={errors.password ? "error" : ""}
							help={errors.password?.message}
							className="mb-6"
						>
							<Controller
								name="password"
								control={control}
								render={({ field }) => (
									<Input.Password
										{...field}
										prefix={<LockOutlined className="text-slate-400" />}
										placeholder="••••••••"
										disabled={isLoading}
										className="h-11 rounded-lg border-slate-200 focus:border-blue-500 hover:border-blue-400 transition-all font-medium text-sm"
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
							className="h-11 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 bg-blue-600 border-0 flex items-center justify-center gap-2"
						>
							Bắt đầu làm việc
						</Button>
					</Form>

					{/* Simple Footer */}
					<div className="mt-8 pt-6 border-t border-slate-100 text-center">
						<p className="text-[11px] text-slate-400 font-medium tracking-wide">
							© {new Date().getFullYear()} UNIVERSITY DIGITAL LIBRARY • V1.0.0
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
