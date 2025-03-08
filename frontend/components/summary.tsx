"use client";

import ReactMarkdown from "react-markdown";

export default function Summary({ summary }: { summary: string | null }) {
	if (!summary) return null;

	return (
		<div className="p-4 border rounded-lg bg-background prose max-w-none overflow-y-auto scrollbar-hide">
			<ReactMarkdown
				components={{
					h1: ({ ...props }) => <h1 className="mt-8 mb-4" {...props} />,
					h2: ({ ...props }) => <h2 className="mt-6 mb-3" {...props} />,
					h3: ({ ...props }) => <h3 className="mt-4 mb-2" {...props} />,
					p: ({ ...props }) => <p className="mt-4 mb-4" {...props} />,
					ul: ({ ...props }) => <ul className="mt-4 mb-4" {...props} />,
					li: ({ ...props }) => <li className="mt-2 mb-2" {...props} />,
				}}
			>
				{summary}
			</ReactMarkdown>
		</div>
	);
}
