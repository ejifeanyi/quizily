"use client";

import { redirect } from "next/navigation";
import { Button } from "./ui/button";

export default function NewSummaryPage() {
	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">Create a New Summary</h1>
			<div className="bg-white rounded-lg shadow p-4">
				<p className="text-muted-foreground">
					Start by uploading a textbook or selecting an existing one to generate
					a summary.
				</p>
				<Button className="mt-4" onClick={() => redirect("/upload-textbook")}>
					Upload Textbook
				</Button>
			</div>
		</div>
	);
}
