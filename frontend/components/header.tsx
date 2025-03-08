"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

const Header: React.FC = () => {
	return (
		<div className="container mx-auto px-4 py-16 text-center">
			<div className="max-w-5xl mx-auto px-6 text-center mb-8">
				<Badge
					variant="outline"
					className="mb-6 bg-primary/10 text-foreground hover:bg-primary/15 border-none relative overflow-hidden p-2 outline-2 outline-gradient-to-r from-primary to-accent-foreground"
				>
					<span className="relative z-10">AI-Powered Learning</span>
					<div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent-foreground blur-sm opacity-30 animate-pulse"></div>
				</Badge>

				<div className="space-y-8">
					<h1 className="text-3xl sm:4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mx-auto">
						<span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
							Learn Smarter, Not Harder.
						</span>
					</h1>

					<p className="text-md sm:lg md:text-xl font-medium text-muted-foreground max-w-3xl mx-auto">
						Unlock the power of AI to transform how you learn. Get instant
						summaries, and adaptive quizzes designed to help you master any
						topic faster.
					</p>
				</div>
			</div>
		</div>
	);
};

export default Header;
