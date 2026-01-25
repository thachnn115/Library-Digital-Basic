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
		<AntFooter className="bg-[#f8fafc] border-t border-slate-200/60 py-10 px-6 mt-auto">
			<div className="max-w-[1400px] mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10">
					{/* About Section */}
					<div className="lg:col-span-2">
						<div className="flex items-center gap-3 mb-5">
							<div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow-md">
								📚
							</div>
							<h3 className="text-base font-bold text-slate-800 tracking-tight">
								Hệ thống Thư viện Số
							</h3>
						</div>
						<p className="text-[13px] text-slate-500 leading-relaxed max-w-sm font-medium">
							Nền tảng quản lý và lưu trữ học liệu số khoa học, hỗ trợ giảng tập và
							nghiên cứu hiệu quả cho toàn bộ giảng viên và sinh viên nhà trường.
						</p>
					</div>

					{/* Quick Links Section */}
					<div>
						<h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
							Điều hướng nhanh
						</h3>
						<ul className="space-y-3">
							<li>
								<Link to="/resources/search" className="text-[13px] text-slate-600 hover:text-blue-600 font-semibold transition-colors">
									Tra cứu học liệu
								</Link>
							</li>
							<li>
								<Link to="/guide" className="text-[13px] text-slate-600 hover:text-blue-600 font-semibold transition-colors">
									Hướng dẫn hệ thống
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact Section */}
					<div>
						<h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
							Hỗ trợ kỹ thuật
						</h3>
						<ul className="space-y-4">
							<li className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
									✉
								</div>
								<a href="mailto:it@university.edu.vn" className="text-[13px] text-slate-600 hover:text-blue-600 font-semibold transition-colors">
									it@university.edu.vn
								</a>
							</li>
							<li className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
									📞
								</div>
								<span className="text-[13px] text-slate-600 font-semibold">
									(024) 3333 8888
								</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Copyright Section */}
				<div className="pt-8 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
						© {currentYear} UNIVERSITY DIGITAL LIBRARY • ALL RIGHTS RESERVED
					</p>
					<div className="flex gap-6 items-center">
						<a href="#" className="text-[11px] text-slate-500 hover:text-blue-600 font-bold uppercase tracking-widest transition-colors">
							Privacy Policy
						</a>
						<a href="#" className="text-[11px] text-slate-500 hover:text-blue-600 font-bold uppercase tracking-widest transition-colors">
							Terms of Use
						</a>
					</div>
				</div>
			</div>
		</AntFooter>
	);
};

