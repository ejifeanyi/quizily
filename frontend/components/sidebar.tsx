"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mock data (Replace with API call)
const summaries = [
	{ id: 1, title: "React Basics", date: "2025-03-07" },
	{ id: 2, title: "Next.js Routing", date: "2025-03-06" },
	{ id: 3, title: "Tailwind Styling", date: "2025-03-05" },
];

const groupSummaries = (
	summaries: { id: number; title: string; date: string }[]
) => {
	const today = new Date().toISOString().split("T")[0];
	const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

	return {
		today: summaries.filter((s) => s.date === today),
		yesterday: summaries.filter((s) => s.date === yesterday),
		previous: summaries.filter((s) => s.date < yesterday),
	};
};

export default function Sidebar() {
	const [search, setSearch] = useState("");
	const { today, yesterday, previous } = groupSummaries(summaries);

	return (
		<aside className="w-72 min-h-screen border-r border-border pr-4 bg-background flex flex-col">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-sm font-semibold">Summaries</h2>
				<Button size="icon" variant="outline">
					<Plus className="h-5 w-5" />
				</Button>
			</div>

			{/* Search Bar */}
			<div className="relative mb-4">
				<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search summaries..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Summaries List */}
			<div className="space-y-4 overflow-auto flex-1 scrollbar-hide">
				<SummaryGroup title="Today" summaries={today} search={search} />
				<SummaryGroup title="Yesterday" summaries={yesterday} search={search} />
				<SummaryGroup title="Previous" summaries={previous} search={search} />
			</div>
		</aside>
	);
}

function SummaryGroup({
	title,
	summaries,
	search,
}: {
	title: string;
	summaries: { id: number; title: string; date: string }[];
	search: string;
}) {
	const filteredSummaries = summaries.filter((s) =>
		s.title.toLowerCase().includes(search.toLowerCase())
	);

	if (filteredSummaries.length === 0) return null;

	return (
		<div>
			<p className="text-xm text-muted-foreground mb-2">{title}</p>
			<ul className="space-y-2">
				{filteredSummaries.map((s) => (
					<li
						key={s.id}
						className="p-2 rounded-lg hover:bg-secondary transition cursor-pointer"
					>
						{s.title}
					</li>
				))}
			</ul>
		</div>
	);
}
