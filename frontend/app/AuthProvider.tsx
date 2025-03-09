"use client";

import {
	createContext,
	useState,
	useEffect,
	useContext,
	ReactNode,
} from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface User {
	userId: string;
	email: string;
	name: string;
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	signup: (name: string, email: string, password: string) => Promise<void>;
	logout: () => void;
	isAuthenticated: boolean;
	showLoginModal: boolean;
	showSignupModal: boolean;
	openLoginModal: () => void;
	openSignupModal: () => void;
	closeModals: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showSignupModal, setShowSignupModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	const apiBaseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode<User & { exp: number }>(token);
				const currentTime = Date.now() / 1000;

				if (decoded.exp < currentTime) {
					console.error("Token expired");
					logout();
				} else {
					setUser(decoded);
					setIsAuthenticated(true);

					const timeout = (decoded.exp - currentTime) * 1000;
					setTimeout(logout, timeout);
				}
			} catch (error) {
				console.error("Invalid token", error);
				logout();
			}
		}
		setLoading(false);
	}, []);

	const login = async (email: string, password: string) => {
		try {
			const res = await axios.post(`${apiBaseUrl}/api/auth/login`, {
				email,
				password,
			});
			localStorage.setItem("token", res.data.token);
			setUser(jwtDecode<User>(res.data.token));
			setIsAuthenticated(true);
			closeModals();
			router.push("/learn");
		} catch (error) {
			console.error("Login failed", error);
			throw new Error("Invalid email or password");
		}
	};

	const signup = async (name: string, email: string, password: string) => {
		try {
			const res = await axios.post(`${apiBaseUrl}/api/auth/signup`, {
				name,
				email,
				password,
			});
			localStorage.setItem("token", res.data.token);
			setUser(jwtDecode<User>(res.data.token));
			setIsAuthenticated(true);
			closeModals();
			router.push("/learn");
		} catch (error) {
			console.error("Signup failed", error);
			throw new Error("Signup failed. Please try again.");
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		setUser(null);
		setIsAuthenticated(false);
		router.push("/");
	};

	const openLoginModal = () => {
		setShowSignupModal(false);
		setShowLoginModal(true);
	};

	const openSignupModal = () => {
		setShowLoginModal(false);
		setShowSignupModal(true);
	};

	const closeModals = () => {
		setShowLoginModal(false);
		setShowSignupModal(false);
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				signup,
				logout,
				isAuthenticated,
				showLoginModal,
				showSignupModal,
				openLoginModal,
				openSignupModal,
				closeModals,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
