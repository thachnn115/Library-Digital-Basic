import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input, Form } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { authApi } from "@/api/auth.api";
import { z } from "zod";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
	email: z.string().email("Email khÃ´ng há»£p lá»‡").min(1, "Email lÃ  báº¯t buá»™c"),
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
				"ÄÃ£ gá»­i link reset máº­t kháº©u vÃ o email cá»§a báº¡n. Vui lÃ²ng kiá»ƒm tra há»™p thÆ°."
			);
			// Navigate to login after 2 seconds
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				"Gá»­i email tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i.";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8fafc] page-fade-in">
			{/* Mesh Background */}
			<div className="absolute inset-0 z-0">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-100/30 rounded-full blur-[120px]" />
			</div>

			<div className="w-full max-w-[440px] px-6 relative z-10">
				<div className="glass-effect rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 p-8 md:p-10">
					<div className="text-center mb-8">
						<div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-2xl shadow-lg mx-auto mb-6">
							ðŸ“§
						</div>
						<h1 className="text-2xl font-bold text-slate-800 tracking-tight">
							QuÃªn máº­t kháº©u
						</h1>
						<p className="text-slate-500 text-sm mt-2 font-medium">
							ChÃºng tÃ´i sáº½ gá»­i liÃªn káº¿t khÃ´i phá»¥c qua email cá»§a báº¡n
						</p>
					</div>

					<Form onFinish={handleSubmit(onSubmit)} layout="vertical" size="large" requiredMark={false}>
						<Form.Item
							label={<span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email khÃ´i phá»¥c</span>}
							validateStatus={errors.email ? "error" : ""}
							help={errors.email?.message}
							className="mb-8"
						>
							<Controller
								name="email"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										prefix={<MailOutlined className="text-slate-400" />}
										placeholder="name@university.edu"
										className="h-11 rounded-lg border-slate-200 focus:border-slate-500 hover:border-slate-400 transition-all font-medium text-sm"
										disabled={isSubmitting}
										type="email"
									/>
								)}
							/>
						</Form.Item>

						<Button
							type="primary"
							htmlType="submit"
							size="large"
							block
							loading={isSubmitting}
							className="h-11 rounded-lg font-bold text-sm bg-slate-800 border-0 shadow-md hover:shadow-lg transition-all"
						>
							Gá»­i yÃªu cáº§u
						</Button>

						<div className="mt-8 text-center pt-6 border-t border-slate-100">
							<Link
								to="/login"
								className="text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
							>
								<ArrowLeftOutlined />
								Quay láº¡i Ä‘Äƒng nháº­p
							</Link>
						</div>
					</Form>
				</div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
