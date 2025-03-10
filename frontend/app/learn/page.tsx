"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { useAuth } from "../AuthProvider";
import UploadTextbookPage from "@/components/upload-textbook";

// This is the main Learn page that will show the upload component
export default function Learn() {
	const { isAuthenticated } = useAuth();
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
		<div className="flex h-screen">
			<Sidebar />
			<div className="flex-grow p-6 overflow-y-auto">
				<div className="flex items-center justify-center h-full">
					<UploadTextbookPage />
				</div>
			</div>
		</div>
	);
}
