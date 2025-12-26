import HomePage from "@pages/client/home/HomePage";
import { RoleEnum, type RouterType } from "../type/common";

export const rootPath = {
	home: {
		index: "/",
	},
};
export const routers: RouterType[] = [
	{
		role: RoleEnum.ADMIN,
		path: rootPath.home.index,
		name: "Home",
		element: HomePage,
	},
];
