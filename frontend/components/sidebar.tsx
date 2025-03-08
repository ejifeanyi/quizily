"use client";

import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Textbook {
	id: string;
	title: string;
}

interface Summary {
	id: string;
	createdAt: string;
	textbook: Textbook;
}

interface GroupedSummaries {
	today: Summary[];
	previous: Summary[];
}

export default function Sidebar() {
	const [summaries, setSummaries] = useState<Summary[]>([]);
	const [search, setSearch] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const activeSummaryId = searchParams.get("summaryId");

	useEffect(() => {
		const fetchSummaries = async () => {
			try {
				setLoading(true);
				const response = await fetch(`${process.env.BASE_URL}/api/summary/`);
				if (!response.ok) {
					throw new Error("Failed to fetch summaries");
				}
				const data = await response.json();
				setSummaries(data);
			} catch (error) {
				console.error("Error fetching summaries:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchSummaries();
	}, []);

	const groupSummaries = (summaries: Summary[]): GroupedSummaries => {
		const today = new Date().toISOString().split("T")[0];

		return {
			today: summaries.filter((s) => s.createdAt.split("T")[0] === today),
			previous: summaries.filter((s) => s.createdAt.split("T")[0] !== today),
		};
	};

	const handleCreateSummary = () => {
		router.push("/upload-textbook");
	};

	const handleSummaryClick = (summaryId: string) => {
		router.push(`${pathname}?summaryId=${summaryId}`);
	};

	const { today, previous } = groupSummaries(summaries);

	return (
		<aside className="w-72 min-h-screen border-r border-border pr-4 bg-background flex flex-col">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-sm font-semibold">Summaries</h2>
				<Button size="icon" variant="outline" onClick={handleCreateSummary}>
					<Plus className="h-5 w-5" />
				</Button>
			</div>

			<div className="relative mb-4">
				<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search summaries..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10"
				/>
			</div>

			<div className="space-y-4 overflow-auto flex-1 scrollbar-hide">
				{loading ? (
					<div className="flex justify-center p-4">
						<p className="text-sm text-muted-foreground">
							Loading summaries...
						</p>
					</div>
				) : summaries.length === 0 ? (
					<div className="flex justify-center p-4">
						<p className="text-sm text-muted-foreground">No summaries found</p>
					</div>
				) : (
					<>
						<SummaryGroup
							title="Today"
							summaries={today}
							search={search}
							onSummaryClick={handleSummaryClick}
							activeSummaryId={activeSummaryId}
						/>
						<SummaryGroup
							title="Previous"
							summaries={previous}
							search={search}
							onSummaryClick={handleSummaryClick}
							activeSummaryId={activeSummaryId}
						/>
					</>
				)}
			</div>
		</aside>
	);
}

interface SummaryGroupProps {
	title: string;
	summaries: Summary[];
	search: string;
	onSummaryClick: (id: string) => void;
	activeSummaryId: string | null;
}

function SummaryGroup({
	title,
	summaries,
	search,
	onSummaryClick,
	activeSummaryId,
}: SummaryGroupProps) {
	const filteredSummaries = summaries.filter((s) =>
		s.textbook.title.toLowerCase().includes(search.toLowerCase())
	);

	if (filteredSummaries.length === 0) return null;

	return (
		<div>
			<p className="text-xs text-muted-foreground mb-2">{title}</p>
			<ul className="space-y-2">
				{filteredSummaries.map((s) => (
					<li
						key={s.id}
						className={`p-2 rounded-lg hover:bg-secondary transition cursor-pointer ${
							activeSummaryId === s.id ? "bg-secondary" : ""
						}`}
						onClick={() => onSummaryClick(s.id)}
					>
						{s.textbook.title}
					</li>
				))}
			</ul>
		</div>
	);
}
