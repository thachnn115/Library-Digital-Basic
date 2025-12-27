import { Layout } from "antd";
import { Link } from "react-router-dom";

const { Footer: AntFooter } = Layout;

/**
 * Footer component for the application
 * Displays copyright, contact information, and useful links
 */
const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	return (
		<AntFooter
			className="border-t-0! mt-auto!"
			style={{
				backgroundColor: "#A3D5FF",
			}}
		>
			<div className="max-w-7xl mx-auto px-6 py-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
					{/* About Section */}
					<div className="lg:col-span-2">
						<h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
							<span className="text-lg">📚</span>
							Hệ thống Quản lý Học liệu Số
						</h3>
						<p className="text-xs text-slate-700 leading-relaxed">
							Hệ thống quản lý và chia sẻ học liệu số cho giảng viên và sinh
							viên. Hỗ trợ tìm kiếm, duyệt và quản lý tài liệu học tập một cách
							hiệu quả.
						</p>
					</div>

					{/* Quick Links Section */}
					<div>
						<h3 className="text-sm font-semibold text-slate-800 mb-2">
							Liên kết nhanh
						</h3>
						<ul className="space-y-1.5 text-xs">
							<li>
								<Link
									to="/guide"
									className="text-slate-700 hover:text-slate-900 transition-colors duration-200"
								>
									Hướng dẫn sử dụng
								</Link>
							</li>
							<li>
								<Link
									to="/contact"
									className="text-slate-700 hover:text-slate-900 transition-colors duration-200"
								>
									Liên hệ - Góp ý
								</Link>
							</li>
							<li>
								<Link
									to="/resources/search"
									className="text-slate-700 hover:text-slate-900 transition-colors duration-200"
								>
									Tìm kiếm học liệu
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact Section */}
					<div>
						<h3 className="text-sm font-semibold text-slate-800 mb-2">
							Liên hệ
						</h3>
						<ul className="space-y-1.5 text-xs text-slate-700">
							<li className="flex items-center gap-1.5">
								<span className="text-[#1e40af]">✉</span>
								<span>support@library.edu.vn</span>
							</li>
							<li className="flex items-center gap-1.5">
								<span className="text-[#1e40af]">📞</span>
								<span>(024) 1234 5678</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Copyright Section */}
				<div className="pt-4 border-t border-slate-300/50">
					<div className="flex flex-col md:flex-row justify-between items-center gap-2">
						<p className="text-xs text-slate-700 text-center md:text-left">
							© {currentYear} Hệ thống Quản lý Học liệu Số. Tất cả quyền được
							bảo lưu.
						</p>
						<div className="flex gap-3 text-xs text-slate-700">
							<a
								href="#"
								className="hover:text-[#1e40af] transition-colors duration-200"
							>
								Chính sách bảo mật
							</a>
							<span className="text-slate-400">|</span>
							<a
								href="#"
								className="hover:text-[#1e40af] transition-colors duration-200"
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

export default Footer;
