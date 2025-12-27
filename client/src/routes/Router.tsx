import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Spin } from "antd";
import { routes } from "@/constants/routes";
import ProtectedRoute from "@/components/layouts/ProtectedRoute";
import MainLayout from "@/components/layouts/MainLayout";
import RootRedirect from "@/components/common/RootRedirect";

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
	<div className="min-h-screen flex items-center justify-center">
		<Spin size="large" />
	</div>
);

/**
 * Main router component
 */
const Router: React.FC = () => {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<Routes>
				{/* Root path - redirect based on authentication */}
				<Route path="/" element={<RootRedirect />} />

				{routes
					.filter((route) => route.path !== "/") // Exclude root path from regular routes
					.map((route) => {
						const {
							path,
							element: Element,
							layout: CustomLayout,
							isProtected,
							requiredRoles,
						} = route;

						// Determine which layout to use
						const LayoutComponent =
							CustomLayout || (isProtected ? MainLayout : undefined);

						let routeElement = <Element />;

						// Wrap with layout if specified
						if (LayoutComponent) {
							routeElement = <LayoutComponent>{routeElement}</LayoutComponent>;
						}

						// Wrap with ProtectedRoute if authentication required
						if (isProtected) {
							routeElement = (
								<ProtectedRoute requiredRoles={requiredRoles}>
									{routeElement}
								</ProtectedRoute>
							);
						}

						return <Route key={path} path={path} element={routeElement} />;
					})}
			</Routes>
		</Suspense>
	);
};

export default Router;
