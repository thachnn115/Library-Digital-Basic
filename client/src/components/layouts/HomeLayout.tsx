import { Header } from "@/components/layouts/components/Header";
import type { LayoutProps } from "@/type/common";
const HomeLayout: React.FC<LayoutProps> = ({ children: Children }) => {
	return (
		<>
			<Header collapsed={false} onToggleCollapse={() => {}} />
			<Children />
		</>
	);
};
export default HomeLayout;
