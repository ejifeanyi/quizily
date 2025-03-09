"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SummaryProps {
	summaryId: string;
}

interface SummaryData {
	id: string;
	content: string;
	textbook: {
		title: string;
	};
}

export default function Summary({ summaryId }: SummaryProps) {
	const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const router = useRouter();

	useEffect(() => {
		const fetchSummary = async () => {
			if (!summaryId) return;

			try {
				setLoading(true);
				console.log("Fetching summary with ID:", summaryId);

				const token = localStorage.getItem("token");
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/summary/summary/${summaryId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error("Failed to fetch summary");
				}

				const data = await response.json();
				console.log("Summary data received:", data);
				setSummaryData(data);
			} catch (error) {
				console.error("Error fetching summary:", error);
				toast.error("Failed to load summary. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchSummary();
	}, [summaryId]);

	const handleQuizStart = () => {
		router.push(`/quiz/${summaryId}`);
	};

	if (!summaryId) {
		console.log("No summary ID provided");
		return null;
	}

	if (loading) {
		return (
			<div className="flex justify-center p-6">
				<div className="text-center">
					<div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-sm text-muted-foreground">Loading summary...</p>
				</div>
			</div>
		);
	}

	if (!summaryData) {
		return (
			<div className="flex flex-col items-center justify-center p-6 space-y-4">
				<p className="text-sm text-muted-foreground">Summary not found</p>
				<Button variant="outline" onClick={() => router.push("/learn")}>
					Return to Upload
				</Button>
			</div>
		);
	}

	return (
		<div className="p-6 bg-background prose max-w-none">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-2xl font-bold m-0">{summaryData.textbook.title}</h1>
				<Button variant="outline" onClick={handleQuizStart}>
					Generate Quiz
				</Button>
			</div>

			<div className="bg-card rounded-lg p-6 shadow-sm">
				<ReactMarkdown
					components={{
						h1: ({ ...props }) => (
							<h1 className="text-xl font-bold mt-8 mb-4" {...props} />
						),
						h2: ({ ...props }) => (
							<h2 className="text-lg font-semibold mt-6 mb-3" {...props} />
						),
						h3: ({ ...props }) => (
							<h3 className="text-base font-medium mt-4 mb-2" {...props} />
						),
						p: ({ ...props }) => (
							<p className="mt-4 mb-4 leading-relaxed" {...props} />
						),
						ul: ({ ...props }) => (
							<ul className="mt-4 mb-4 list-disc pl-5" {...props} />
						),
						li: ({ ...props }) => <li className="mt-2 mb-2" {...props} />,
						blockquote: ({ ...props }) => (
							<blockquote
								className="border-l-4 border-muted pl-4 italic my-4"
								{...props}
							/>
						),
						code: ({ ...props }) => (
							<code
								className="bg-muted text-muted-foreground rounded px-1 py-0.5"
								{...props}
							/>
						),
						pre: ({ ...props }) => (
							<pre
								className="bg-muted p-4 rounded-md overflow-x-auto my-4"
								{...props}
							/>
						),
					}}
				>
					{summaryData.content}
				</ReactMarkdown>
			</div>

			<div className="mt-8 text-center">
				<Button onClick={handleQuizStart} size="lg">
					Start Quiz
				</Button>
			</div>
		</div>
	);
}
