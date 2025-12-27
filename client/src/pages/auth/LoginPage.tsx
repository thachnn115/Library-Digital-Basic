import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
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
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
			<div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">
						Hệ thống Quản lý Học liệu
					</h1>
					<p className="text-gray-600">Đăng nhập để tiếp tục</p>
				</div>

				<Form onFinish={handleSubmit(onSubmit)} layout="vertical">
					<Form.Item
						validateStatus={errors.email ? "error" : ""}
						help={errors.email?.message}
					>
						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									prefix={<UserOutlined />}
									placeholder="Email"
									size="large"
									disabled={isLoading}
									type="email"
									autoComplete="email"
								/>
							)}
						/>
					</Form.Item>

					<Form.Item
						validateStatus={errors.password ? "error" : ""}
						help={errors.password?.message}
					>
						<Controller
							name="password"
							control={control}
							render={({ field }) => (
								<Input.Password
									{...field}
									prefix={<LockOutlined />}
									placeholder="Mật khẩu"
									size="large"
									disabled={isLoading}
									autoComplete="current-password"
								/>
							)}
						/>
					</Form.Item>

					<div className="flex items-center justify-between mb-6">
						<Link
							to="/forgot-password"
							className="text-sm text-blue-600 hover:text-blue-700"
						>
							Quên mật khẩu?
						</Link>
					</div>

					<Button
						type="primary"
						htmlType="submit"
						size="large"
						block
						loading={isLoading}
					>
						Đăng nhập
					</Button>
				</Form>

				<div className="mt-6 text-center text-sm text-gray-600">
					<p>Phiên bản 1.0.0</p>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
