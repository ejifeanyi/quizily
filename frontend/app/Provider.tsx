"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./AuthProvider";
import ToastProvider from "./ToastProvider";
import Navbar from "@/components/navbar";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<AuthProvider>
				<ToastProvider>
					<Navbar />
					{children}
				</ToastProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}
