import type { ComponentType } from "react";

// Lazy load pages
import { lazy } from "react";

// Auth pages
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(
	() => import("@/pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const FirstLoginPage = lazy(() => import("@/pages/auth/FirstLoginPage"));

// Common pages
const UnauthorizedPage = lazy(() => import("@/pages/UnauthorizedPage"));

// Lecturer pages
const HomePage = lazy(() => import("@/pages/client/home/HomePage"));
const ResourceSearchPage = lazy(
	() => import("@/pages/lecturer/ResourceSearchPage")
);
const MyResourcesPage = lazy(() => import("@/pages/lecturer/MyResourcesPage"));
const ResourceUploadPage = lazy(
	() => import("@/pages/lecturer/ResourceUploadPage")
);
const ResourceDetailPage = lazy(
	() => import("@/pages/lecturer/ResourceDetailPage")
);
const ProfilePage = lazy(() => import("@/pages/lecturer/ProfilePage"));
const GuidePage = lazy(() => import("@/pages/lecturer/GuidePage"));

// Admin pages
const AdminDashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const UserManagementPage = lazy(
	() => import("@/pages/admin/UserManagementPage")
);
const CategoryManagementPage = lazy(
	() => import("@/pages/admin/CategoryManagementPage")
);
const SystemStatsPage = lazy(() => import("@/pages/admin/SystemStatsPage"));

// Sub-Admin pages
const SubAdminDashboardPage = lazy(
	() => import("@/pages/sub-admin/DashboardPage")
);
const SubAdminUserManagementPage = lazy(
	() => import("@/pages/sub-admin/UserManagementPage")
);
const SubAdminCourseManagementPage = lazy(
	() => import("@/pages/sub-admin/CourseManagementPage")
);
const SubAdminStatsPage = lazy(() => import("@/pages/sub-admin/StatsPage"));

// Define route paths as constants
export const ROUTES = {
	// Public routes
	LOGIN: "/login",
	FORGOT_PASSWORD: "/forgot-password",
	RESET_PASSWORD: "/reset-password",
	FIRST_LOGIN: "/first-login",
	UNAUTHORIZED: "/unauthorized",

	// Lecturer routes
	HOME: "/",
	RESOURCES_SEARCH: "/resources/search",
	RESOURCES_UPLOAD: "/resources/upload",
	RESOURCES_DETAIL: "/resources/:id",
	MY_RESOURCES: "/resources/my-resources",
	PROFILE: "/profile",
	GUIDE: "/guide",

	// Admin routes
	ADMIN_DASHBOARD: "/admin/dashboard",
	ADMIN_USERS: "/admin/users",
	ADMIN_CATEGORIES: "/admin/categories",
	ADMIN_STATS: "/admin/stats",

	// Sub-Admin routes
	SUB_ADMIN_DASHBOARD: "/sub-admin/dashboard",
	SUB_ADMIN_USERS: "/sub-admin/users",
	SUB_ADMIN_COURSES: "/sub-admin/courses",
	SUB_ADMIN_STATS: "/sub-admin/stats",

	// Student routes
	STUDENT_HOME: "/student/home",
	STUDENT_RESOURCES: "/student/resources",
	STUDENT_PROFILE: "/student/profile",
} as const;

export interface RouteConfig {
	path: string;
	element: ComponentType;
	layout?: ComponentType<{ children: React.ReactNode }>;
	isProtected?: boolean;
	requiredRoles?: ("ADMIN" | "SUB_ADMIN" | "LECTURER" | "STUDENT")[];
}

/**
 * Application routes configuration
 */
export const routes: RouteConfig[] = [
	// Public routes (no authentication required)
	{
		path: ROUTES.LOGIN,
		element: LoginPage,
	},
	{
		path: ROUTES.FORGOT_PASSWORD,
		element: ForgotPasswordPage,
	},
	{
		path: ROUTES.RESET_PASSWORD,
		element: ResetPasswordPage,
	},
	{
		path: ROUTES.FIRST_LOGIN,
		element: FirstLoginPage,
	},
	{
		path: ROUTES.UNAUTHORIZED,
		element: UnauthorizedPage,
	},

	// Lecturer routes (protected)
	{
		path: ROUTES.HOME,
		element: HomePage,
		isProtected: true,
		requiredRoles: ["ADMIN", "SUB_ADMIN", "LECTURER"],
	},
	{
		path: ROUTES.RESOURCES_SEARCH,
		element: ResourceSearchPage,
		isProtected: true,
		requiredRoles: ["ADMIN", "SUB_ADMIN", "LECTURER"],
	},
	{
		path: ROUTES.RESOURCES_UPLOAD,
		element: ResourceUploadPage,
		isProtected: true,
		requiredRoles: ["ADMIN", "SUB_ADMIN", "LECTURER"],
	},
	{
		path: ROUTES.MY_RESOURCES,
		element: MyResourcesPage,
		isProtected: true,
		requiredRoles: ["ADMIN", "SUB_ADMIN", "LECTURER"],
	},
	{
		path: ROUTES.RESOURCES_DETAIL,
		element: ResourceDetailPage,
		isProtected: true,
		requiredRoles: ["ADMIN", "SUB_ADMIN", "LECTURER", "STUDENT"],
	},
	{
		path: ROUTES.PROFILE,
		element: ProfilePage,
		isProtected: true,
		requiredRoles: ["ADMIN", "SUB_ADMIN", "LECTURER"],
	},
	{
		path: ROUTES.GUIDE,
		element: GuidePage,
		isProtected: true,
		requiredRoles: ["ADMIN", "SUB_ADMIN", "LECTURER", "STUDENT"],
	},

	// Student routes
	{
		path: ROUTES.STUDENT_HOME,
		// Reuse ResourceSearchPage for now, or create simple Home
		// But plan says StudentResourcePage for resources. Let's redirect home to resources or make a dashboard.
		// For simplicity, Student Home = Student Resources
		element: lazy(() => import("@/pages/student/StudentResourcePage")),
		isProtected: true,
		requiredRoles: ["STUDENT"],
	},
	{
		path: ROUTES.STUDENT_RESOURCES,
		element: lazy(() => import("@/pages/student/StudentResourcePage")),
		isProtected: true,
		requiredRoles: ["STUDENT"],
	},
	{
		path: ROUTES.STUDENT_PROFILE,
		element: ProfilePage, // Reuse ProfilePage
		isProtected: true,
		requiredRoles: ["STUDENT"],
	},

	// Admin routes (protected)
	{
		path: ROUTES.ADMIN_DASHBOARD,
		element: AdminDashboardPage,
		isProtected: true,
		requiredRoles: ["ADMIN"],
	},
	{
		path: ROUTES.ADMIN_USERS,
		element: UserManagementPage,
		isProtected: true,
		requiredRoles: ["ADMIN"],
	},
	{
		path: ROUTES.ADMIN_CATEGORIES,
		element: CategoryManagementPage,
		isProtected: true,
		requiredRoles: ["ADMIN"],
	},
	{
		path: ROUTES.ADMIN_STATS,
		element: SystemStatsPage,
		isProtected: true,
		requiredRoles: ["ADMIN"],
	},

	// Sub-Admin routes (protected)
	{
		path: ROUTES.SUB_ADMIN_DASHBOARD,
		element: SubAdminDashboardPage,
		isProtected: true,
		requiredRoles: ["SUB_ADMIN"],
	},
	{
		path: ROUTES.SUB_ADMIN_USERS,
		element: SubAdminUserManagementPage,
		isProtected: true,
		requiredRoles: ["SUB_ADMIN"],
	},
	{
		path: ROUTES.SUB_ADMIN_COURSES,
		element: SubAdminCourseManagementPage,
		isProtected: true,
		requiredRoles: ["SUB_ADMIN"],
	},
	{
		path: ROUTES.SUB_ADMIN_STATS,
		element: SubAdminStatsPage,
		isProtected: true,
		requiredRoles: ["SUB_ADMIN"],
	},
];

// Legacy support (for backward compatibility)
export const rootPath = {
	home: {
		index: ROUTES.HOME,
	},
	auth: {
		login: ROUTES.LOGIN,
		forgotPassword: ROUTES.FORGOT_PASSWORD,
		resetPassword: ROUTES.RESET_PASSWORD,
		firstLogin: ROUTES.FIRST_LOGIN,
	},
} as const;
