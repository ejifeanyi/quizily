"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Summary from "@/components/summary";
import { useAuth } from "@/app/AuthProvider";

export default function SummaryPage() {
	const { isAuthenticated } = useAuth();
	const router = useRouter();
	const params = useParams();
	const summaryId = params?.summaryId as string;

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
			<Sidebar />
			<div className="flex-grow overflow-y-auto">
				<div className="max-w-4xl mx-auto">
					<Summary summaryId={summaryId} />
				</div>
			</div>
		</div>
	);
}
