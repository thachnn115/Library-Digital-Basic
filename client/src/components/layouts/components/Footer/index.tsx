import { Layout } from "antd";
import { Link } from "react-router-dom";

const { Footer: AntFooter } = Layout;

/**
 * Footer component for the application
 * Displays copyright, contact information, and useful links
 */
export const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	return (
		<AntFooter
			className="border-t-0! mt-auto! relative overflow-hidden"
			style={{
				background: "linear-gradient(180deg, #A3D5FF 0%, #8BC5F0 100%)",
			}}
		>
			{/* Decorative overlay */}
			<div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
			
			<div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
					{/* About Section */}
					<div className="lg:col-span-2">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg">
								📚
							</div>
							<div>
								<h3 className="text-base font-bold text-slate-800 mb-1">
									Hệ thống Quản lý Học liệu Số
								</h3>
								<p className="text-xs text-slate-600/90">
									Thư viện số hiện đại
								</p>
							</div>
						</div>
						<p className="text-sm text-slate-700 leading-relaxed max-w-md">
							Hệ thống quản lý và chia sẻ học liệu số cho giảng viên và sinh
							viên. Hỗ trợ tìm kiếm, duyệt và quản lý tài liệu học tập một cách
							hiệu quả.
						</p>
					</div>

					{/* Quick Links Section */}
					<div>
						<h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">
							Liên kết nhanh
						</h3>
						<ul className="space-y-2.5">
							<li>
								<Link
									to="/guide"
									className="text-sm text-slate-700 hover:text-slate-900 transition-all duration-200 flex items-center gap-2 group"
								>
									<span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-slate-600 transition-colors" />
									Hướng dẫn sử dụng
								</Link>
							</li>
							<li>
								<Link
									to="/resources/search"
									className="text-sm text-slate-700 hover:text-slate-900 transition-all duration-200 flex items-center gap-2 group"
								>
									<span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-slate-600 transition-colors" />
									Tìm kiếm học liệu
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact Section */}
					<div>
						<h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">
							Liên hệ
						</h3>
						<ul className="space-y-3 text-sm text-slate-700">
							<li className="flex items-center gap-3 group">
								<div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-base shadow-sm group-hover:bg-white/30 transition-colors">
									✉
								</div>
								<a 
									href="mailto:support@library.edu.vn"
									className="hover:text-slate-900 transition-colors duration-200"
								>
									support@library.edu.vn
								</a>
							</li>
							<li className="flex items-center gap-3 group">
								<div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-base shadow-sm group-hover:bg-white/30 transition-colors">
									📞
								</div>
								<a 
									href="tel:+842412345678"
									className="hover:text-slate-900 transition-colors duration-200"
								>
									(024) 1234 5678
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Copyright Section */}
				<div className="pt-6 border-t border-white/30">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<p className="text-sm text-slate-700 text-center md:text-left font-medium">
							© {currentYear} Hệ thống Quản lý Học liệu Số. Tất cả quyền được
							bảo lưu.
						</p>
						<div className="flex gap-4 text-sm text-slate-700">
							<a
								href="#"
								className="hover:text-slate-900 transition-colors duration-200 font-medium"
							>
								Chính sách bảo mật
							</a>
							<span className="text-slate-400">•</span>
							<a
								href="#"
								className="hover:text-slate-900 transition-colors duration-200 font-medium"
							>
								Điều khoản sử dụng
							</a>
						</div>
					</div>
				</div>
			</div>
		</AntFooter>
	);
};

