"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
	const { isAuthenticated } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/");
		}
	}, [isAuthenticated, router]);

	return isAuthenticated ? children : null;
};
