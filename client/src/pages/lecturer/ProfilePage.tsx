import { Card } from 'antd';
import { ProfileView } from '@/components/modules/profile/ProfileView';

/**
 * Profile Page - User profile management
 */
const ProfilePage: React.FC = () => {
	return (
		<div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
			{/* Scientific Page Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
				<div className="flex-1">
					<div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider mb-3">
						<span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
						Thiết lập tài khoản
					</div>
					<h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
						Thông tin <span className="text-blue-600">Cá nhân</span>
					</h1>
					<p className="text-slate-500 font-medium mt-1">
						Quản lý hồ sơ, bảo mật và các cài đặt định danh của bạn.
					</p>
				</div>
			</div>

			<ProfileView />
		</div>
	);
};

export default ProfilePage;

