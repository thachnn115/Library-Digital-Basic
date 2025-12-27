import Header from "@/components/Header";
import type { LayoutProps } from "@/type/common";
const HomeLayout: React.FC<LayoutProps> = ({ children: Children }) => {
	return (
		<>
			<Header />
			<Children />
		</>
	);
};
export default HomeLayout;
