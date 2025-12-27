import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@api": path.resolve(__dirname, "src/api"),
			"@components": path.resolve(__dirname, "src/components"),
			"@constants": path.resolve(__dirname, "src/constants"),
			"@hooks": path.resolve(__dirname, "src/hooks"),
			"@pages": path.resolve(__dirname, "src/pages"),
			"@stores": path.resolve(__dirname, "src/stores"),
			"@types": path.resolve(__dirname, "src/types"),
			"@utils": path.resolve(__dirname, "src/utils"),
			"@assets": path.resolve(__dirname, "src/assets"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					"react-vendor": ["react", "react-dom", "react-router-dom"],
					"antd-vendor": ["antd"],
					"query-vendor": ["@tanstack/react-query"],
					"form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
					"pdf-vendor": ["react-pdf"],
				},
			},
		},
		chunkSizeWarningLimit: 1000,
	},
});
