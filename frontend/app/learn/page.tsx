"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { useAuth } from "../AuthProvider";
import Upload from "@/components/upload-button";
import Summary from "@/components/summary";

export default function LearnPage() {
	const { isAuthenticated } = useAuth();
	const [summary, setSummary] = useState<string | null>(null);

	const router = useRouter();

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/");
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="flex">
			<div className="min-h-screen overflow-y-auto p-4 scrollbar-hide">
				<Sidebar />
			</div>

			<div className="flex-1 flex flex-col min-h-screen">
				<div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
					<Summary summary={summary} />
				</div>

				<div className="p-4 bg-background sticky bottom-0">
					<Upload onUploadSuccess={setSummary} />
				</div>
			</div>
		</div>
	);
}
