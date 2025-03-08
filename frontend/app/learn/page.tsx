"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import SummaryPage from "@/components/summary-page";
import { useAuth } from "../AuthProvider";

export default function LearnPage() {
	const { isAuthenticated } = useAuth();
	const router = useRouter();

	// Redirect unauthenticated users to the login page
	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/");
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="flex h-screen">
			{/* Fixed Sidebar */}
			<div className="min-h-screen overflow-y-auto p-4 scrollbar-hide">
				<Sidebar />
			</div>

			{/* Scrollable Main Content */}
			<div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
				<SummaryPage />
			</div>
		</div>
	);
}
