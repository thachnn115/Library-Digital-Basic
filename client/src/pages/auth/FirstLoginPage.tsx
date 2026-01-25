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
		<div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8fafc] page-fade-in">
			{/* Mesh Background */}
			<div className="absolute inset-0 z-0">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]" />
			</div>

			<div className="w-full max-w-[520px] px-6 relative z-10">
				<div className="glass-effect rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 p-8 md:p-10">
					<div className="text-center mb-8">
						<div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-lg mx-auto mb-6 transition-transform hover:scale-105">
							🔐
						</div>
						<h1 className="text-2xl font-bold text-slate-800 tracking-tight">
							Thiết lập Lần đầu
						</h1>
						<p className="text-slate-500 text-sm mt-2 font-medium">
							Vui lòng thay đổi mật khẩu mặc định để đảm bảo an toàn
						</p>
					</div>

					<Form onFinish={handleSubmit(onSubmit)} layout="vertical" size="large" requiredMark={false}>
						<Form.Item
							label={<span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mật khẩu mới</span>}
							validateStatus={errors.newPassword ? "error" : ""}
							help={errors.newPassword?.message}
							className="mb-4"
						>
							<Input.Password
								{...register("newPassword")}
								prefix={<LockOutlined className="text-slate-400" />}
								placeholder="Nhập ít nhất 8 ký tự"
								className="h-11 rounded-lg border-slate-200 focus:border-indigo-500 hover:border-indigo-400 transition-all font-medium text-sm"
								disabled={firstLoginMutation.isPending}
							/>
						</Form.Item>

						<Form.Item
							label={<span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Xác nhận mật khẩu</span>}
							validateStatus={errors.confirmPassword ? "error" : ""}
							help={errors.confirmPassword?.message}
							className="mb-6"
						>
							<Input.Password
								{...register("confirmPassword")}
								prefix={<LockOutlined className="text-slate-400" />}
								placeholder="Nhập lại mật khẩu mới"
								className="h-11 rounded-lg border-slate-200 focus:border-indigo-500 hover:border-indigo-400 transition-all font-medium text-sm"
								disabled={firstLoginMutation.isPending}
							/>
						</Form.Item>

						<div className="mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
							<p className="text-[11px] text-slate-500 mb-3 font-bold uppercase tracking-widest">
								Tiêu chuẩn bảo mật:
							</p>
							<ul className="grid grid-cols-2 gap-x-4 gap-y-2">
								<li className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
									<div className="w-1 h-1 rounded-full bg-blue-500" /> Ít nhất 8 ký tự
								</li>
								<li className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
									<div className="w-1 h-1 rounded-full bg-blue-500" /> Chứa chữ hoa
								</li>
								<li className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
									<div className="w-1 h-1 rounded-full bg-blue-500" /> Chứa chữ thường
								</li>
								<li className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
									<div className="w-1 h-1 rounded-full bg-blue-500" /> Chứa chữ số
								</li>
							</ul>
						</div>

						<Button
							type="primary"
							htmlType="submit"
							size="large"
							loading={firstLoginMutation.isPending}
							block
							className="h-11 rounded-lg font-bold text-sm bg-indigo-600 border-0 shadow-md hover:shadow-lg transition-all"
						>
							Cập nhật tài khoản
						</Button>
					</Form>
				</div>
			</div>
		</div>
	);
};

export default FirstLoginPage;
