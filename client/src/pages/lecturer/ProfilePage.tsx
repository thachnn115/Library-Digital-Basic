import { Card } from 'antd';
import { ProfileView } from '@/components/modules/profile/ProfileView';

/**
 * Profile Page - User profile management
 */
const ProfilePage: React.FC = () => {
	return (
		<div className="container mx-auto px-4 py-6">
			<Card>
				<h1 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h1>
				<ProfileView />
			</Card>
		</div>
	);
};

export default ProfilePage;

