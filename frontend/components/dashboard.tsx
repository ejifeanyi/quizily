import Sidebar from "@/components/sidebar";

export default function Dashboard() {
	return (
		<div className="flex h-screen">
			{/* Fixed Sidebar */}
			<div className="min-h-screen overflow-y-auto p-4 scrollbar-hide">
				<Sidebar />
			</div>

			{/* Scrollable Main Content */}
			<div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
				<p className="text-lg">Hello Quizily</p>
				<div className="h-[200vh] bg-gray-100">Scroll here to test</div>
			</div>
		</div>
	);
}
