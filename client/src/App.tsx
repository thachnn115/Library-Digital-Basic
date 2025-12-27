import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";
import Router from "./routes/Router";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import "./App.css";

// Create a client with optimized configuration
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
			staleTime: 30 * 1000, // 30 seconds - shorter staleTime for better data freshness
			gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
			refetchOnMount: true, // Always refetch when component mounts
			refetchOnReconnect: true,
		},
		mutations: {
			retry: 0,
		},
	},
});

function App() {
	// Ant Design theme configuration - Professional Slate/Indigo color scheme
	const antdTheme = {
		algorithm: theme.defaultAlgorithm,
		token: {
			colorPrimary: "#4f46e5", // Indigo-600 - Professional and trustworthy
			colorSuccess: "#10b981", // Emerald-500 - Fresh and positive
			colorWarning: "#f59e0b", // Amber-500 - Attention-grabbing
			colorError: "#ef4444", // Red-500 - Clear error indication
			colorInfo: "#06b6d4", // Cyan-500 - Modern accent color
			borderRadius: 8,
			fontFamily: '"ptsans", sans-serif',
			colorBgContainer: "#ffffff",
			colorBgElevated: "#ffffff",
			colorBorder: "#e2e8f0", // Slate-200
			colorText: "#1e293b", // Slate-800
		},
		components: {
			Button: {
				borderRadius: 8,
				fontWeight: 500,
				primaryShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06)",
			},
			Card: {
				borderRadius: 12,
				boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
			},
			Input: {
				borderRadius: 8,
				activeBorderColor: "#4f46e5",
				hoverBorderColor: "#6366f1",
			},
			Menu: {
				borderRadius: 8,
				itemActiveBg: "rgba(79, 70, 229, 0.1)",
				itemSelectedBg: "rgba(79, 70, 229, 0.15)",
			},
		},
	};

	return (
		<QueryClientProvider client={queryClient}>
			<ConfigProvider locale={viVN} theme={antdTheme}>
				<BrowserRouter>
					<ErrorBoundary>
						<Router />
						<Toaster
							position="top-right"
							richColors
							expand={false}
							duration={3000}
						/>
					</ErrorBoundary>
				</BrowserRouter>
			</ConfigProvider>
		</QueryClientProvider>
	);
}

export default App;
