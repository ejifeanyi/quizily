"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import NewSummaryPage from "./new-summary";

interface Textbook {
	id: string;
	title: string;
	content: string;
}

interface Summary {
	id: string;
	content: string;
	createdAt: string;
	textbook: Textbook;
}

export default function SummaryPage() {
	const [summary, setSummary] = useState<Summary | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const searchParams = useSearchParams();
	const summaryId = searchParams.get("summaryId");

	useEffect(() => {
		const fetchSummaryDetails = async () => {
			try {
				setLoading(true);
				const response = await fetch(
					`${process.env.BASE_URL}/api/summaries/${summaryId}`
				);
				if (!response.ok) {
					throw new Error("Failed to fetch summary details");
				}
				const data = await response.json();
				setSummary(data);
			} catch (error) {
				console.error("Error fetching summary details:", error);
			} finally {
				setLoading(false);
			}
		};

		if (summaryId) {
			fetchSummaryDetails();
		} else {
			setLoading(false);
		}
	}, [summaryId]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<p>Loading summary...</p>
			</div>
		);
	}

	if (!summaryId) {
		return <NewSummaryPage />;
	}

	if (!summary) {
		return (
			<div className="flex items-center justify-center h-full">
				<p>Summary not found</p>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">{summary.textbook.title}</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-white rounded-lg shadow p-4">
					<h2 className="text-lg font-semibold mb-3">Original Text</h2>
					<div className="prose max-w-none">
						<p>{summary.textbook.content}</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-4">
					<h2 className="text-lg font-semibold mb-3">Summary</h2>
					<div className="prose max-w-none">
						<p>{summary.content}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
