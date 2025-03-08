import React from "react";
import { Card } from "./ui/card";

interface FeatureItem {
	icon: React.ReactNode;
	title: string;
	description: string;
}

const HowItWorks: React.FC = () => {
	const features: FeatureItem[] = [
		{
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6 text-primary"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="17 8 12 3 7 8" />
					<line x1="12" y1="3" x2="12" y2="15" />
				</svg>
			),
			title: "Step 1: Share Your Content",
			description:
				"Upload a PDF or paste your text. Our platform supports a wide range of formats, so you can learn from any source.",
		},
		{
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6 text-primary"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
			),
			title: "Step 2: Summarize in Seconds",
			description:
				"Our AI analyzes your content and generates a concise, easy-to-understand summary. Focus on what matters most.",
		},
		{
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6 text-primary"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
			),
			title: "Step 3: Take a Smart Quiz",
			description:
				"Reinforce your learning with adaptive quizzes tailored to your content. Questions evolve based on your progress.",
		},
		{
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6 text-primary"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
			),
			title: "Step 4: Grow with Insights",
			description:
				"Get AI-driven recommendations for further learning. Discover new resources, topics, and strategies to keep improving.",
		},
	];

	return (
		<div className="space-y-8">
			<Card className="p-8 border border-border bg-card/80 backdrop-blur-sm shadow-md">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{features.map((feature, index) => (
						<div key={index} className="space-y-3">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
									{feature.icon}
								</div>
								<h3 className="text-lg font-semibold text-foreground">
									{feature.title}
								</h3>
							</div>
							<p className="text-muted-foreground pl-14">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</Card>

			{/* Supporting text */}
			<p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto text-center">
				Join thousands of learners who are already using AI to learn smarter,
				not harder. Our platform is designed to help you master any topic faster
				and more effectively.
			</p>
		</div>
	);
};

export default HowItWorks;
