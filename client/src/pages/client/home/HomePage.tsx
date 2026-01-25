import { Button, Typography } from "antd";
import {
	SearchOutlined,
	UploadOutlined,
	FileTextOutlined,
	QuestionCircleOutlined,
	ArrowRightOutlined,
	DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

/**
 * Home Page - Lecturer dashboard with quick actions
 */
const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	return (
		<div className="space-y-10 page-entrance">
			{/* High-Impact Premium Hero */}
			<div className="relative overflow-hidden rounded-[32px] bg-slate-900 border border-slate-800 p-8 md:p-12 shadow-2xl">
				<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
				<div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

				<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
					<div className="max-w-xl text-center md:text-left">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-black uppercase tracking-[0.2em] mb-6 border border-blue-500/20">
							<span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
							Executive Workspace
						</div>
						<h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-4">
							Xin chào, <span className="text-premium-gradient">{user?.fullName.split(' ').pop()}</span>
						</h1>
						<p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
							Chào mừng bạn trở lại với trung tâm quản lý học liệu khoa <span className="text-white font-bold">{user?.department?.name || "Hệ thống"}</span>.
							Mọi thứ đã sẵn sàng để bạn tối ưu hóa quy trình giảng dạy.
						</p>
						<div className="flex flex-wrap justify-center md:justify-start gap-4">
							<Button
								type="primary"
								size="large"
								icon={<SearchOutlined />}
								className="h-14 px-8 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center gap-3"
								onClick={() => navigate(ROUTES.RESOURCES_SEARCH)}
							>
								Khám phá ngay
							</Button>
							<Button
								size="large"
								icon={<QuestionCircleOutlined />}
								className="h-14 px-8 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-3"
								onClick={() => navigate(ROUTES.GUIDE)}
							>
								Tài liệu hướng dẫn
							</Button>
						</div>
					</div>

					{/* Animated Metrics Box */}
					<div className="hidden lg:flex flex-col gap-4 animate-float">
						<div className="premium-card p-6 bg-white/5 backdrop-blur-xl border-white/10 w-64">
							<div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</div>
							<div className="text-2xl font-black text-white">Active</div>
							<div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
								<div className="h-full w-2/3 bg-premium-gradient" />
							</div>
						</div>
						<div className="premium-card p-6 bg-white/5 backdrop-blur-xl border-white/10 w-64 translate-x-8">
							<div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Performance</div>
							<div className="text-2xl font-black text-emerald-400">Optimal</div>
						</div>
					</div>
				</div>
			</div>

			{/* Strategy Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{/* Search Card */}
				<div
					className="premium-card p-8 group cursor-pointer relative"
					onClick={() => navigate(ROUTES.RESOURCES_SEARCH)}
				>
					<div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl text-blue-600 mb-8 group-hover:bg-premium-gradient group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-sm">
						<SearchOutlined />
					</div>
					<h3 className="text-xl font-extrabold text-slate-800 mb-3">Tra cứu thông minh</h3>
					<p className="text-slate-500 font-medium leading-relaxed mb-8 min-h-[60px]">
						Tìm kiếm chính xác tài liệu bạn cần với bộ lọc đa chiều và tốc độ truy xuất tối ưu.
					</p>
					<div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
						GO TO DISCOVERY <ArrowRightOutlined />
					</div>
				</div>

				{/* Upload Card */}
				<div
					className="premium-card p-8 group cursor-pointer relative"
					onClick={() => navigate(ROUTES.RESOURCES_UPLOAD)}
				>
					<div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl text-emerald-600 mb-8 group-hover:bg-linear-to-br from-emerald-500 to-teal-600 group-hover:text-white transition-all duration-500 group-hover:-rotate-6 shadow-sm">
						<UploadOutlined />
					</div>
					<h3 className="text-xl font-extrabold text-slate-800 mb-3">Cập nhật học liệu</h3>
					<p className="text-slate-500 font-medium leading-relaxed mb-8 min-h-[60px]">
						Số hóa bài giảng và chia sẻ kiến thức với hệ thống bảo mật và chuyển đổi PDF tự động.
					</p>
					<div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
						UPLOAD ASSETS <ArrowRightOutlined />
					</div>
				</div>

				{/* Storage Card */}
				<div
					className="premium-card p-8 group cursor-pointer relative"
					onClick={() => navigate(ROUTES.MY_RESOURCES)}
				>
					<div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl text-indigo-600 mb-8 group-hover:bg-linear-to-br from-indigo-500 to-purple-600 group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-sm">
						<FileTextOutlined />
					</div>
					<h3 className="text-xl font-extrabold text-slate-800 mb-3">Kho lưu trữ riêng</h3>
					<p className="text-slate-500 font-medium leading-relaxed mb-8 min-h-[60px]">
						Quản lý tập trung tất cả học liệu cá nhân và theo dõi lịch sử tương tác của người dùng.
					</p>
					<div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
						MANAGE STORAGE <ArrowRightOutlined />
					</div>
				</div>
			</div>

			{/* System Footer Intelligence */}
			<div className="executive-glass rounded-[24px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 border-white/60">
				<div className="flex gap-4 items-center">
					<div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 text-xl">
						<DashboardOutlined />
					</div>
					<div>
						<h4 className="font-extrabold text-slate-800">Tối ưu hóa Tài nguyên</h4>
						<p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Acceleration Enabled</p>
					</div>
				</div>
				<div className="h-px w-full md:w-px md:h-12 bg-slate-200" />
				<div className="flex-1 max-w-lg">
					<p className="text-sm font-medium text-slate-500 leading-relaxed">
						Hệ thống sử dụng công nghệ nén Multi-Layer giúp học liệu tải nhanh hơn 40% trên thiết bị di động.
					</p>
				</div>
			</div>
		</div>
	);
};

export default HomePage;

