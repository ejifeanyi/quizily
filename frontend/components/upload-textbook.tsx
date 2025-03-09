"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, AlertCircle, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function UploadTextbookPage() {
	const [file, setFile] = useState<File | null>(null);
	const [textContent, setTextContent] = useState<string>("");
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
	const router = useRouter();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0];
			if (selectedFile.type !== "application/pdf") {
				toast.error("Please select a PDF file");
				return;
			}
			setFile(selectedFile);
		}
	};

	const handleTextChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>
	): void => {
		setTextContent(e.target.value);
	};

	const handleSubmit = async (
		e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>
	) => {
		e.preventDefault();

		// Check if we have valid content based on active tab
		if (activeTab === "upload" && !file) {
			toast.error("Please select a PDF file to upload");
			return;
		}

		if (activeTab === "paste" && !textContent.trim()) {
			toast.error("Please enter text content");
			return;
		}

		setIsUploading(true);

		// Simulate progress for better UX
		const progressInterval = setInterval(() => {
			setUploadProgress((prev) => {
				if (prev >= 90) {
					clearInterval(progressInterval);
					return prev;
				}
				return prev + 10;
			});
		}, 500);

		try {
			const formData = new FormData();

			if (activeTab === "upload") {
				formData.append("file", file!);
				console.log(
					"Processing PDF file:",
					file?.name,
					"Size:",
					(file?.size || 0) / 1024,
					"KB"
				);
			} else {
				// Send text content directly
				formData.append("text", textContent);
				console.log(
					"Processing pasted text, Length:",
					textContent.length,
					"characters"
				);
			}

			const token = localStorage.getItem("token");
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/textbook/upload`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to process content`);
			}

			const data = await response.json();
			console.log("Received response:", data);

			// Complete progress
			setUploadProgress(100);

			// Handle the summary - redirect to the summary page
			if (data.summaryId) {
				toast.success(`Content processed successfully`);
				console.log(`Redirecting to summary page with ID: ${data.summaryId}`);

				// Navigate to the summary page with the ID
				router.push(`/learn/${data.summaryId}`);
			} else {
				toast.error("No summary ID returned from server");
			}
		} catch (error) {
			console.error("Processing error:", error);
			toast.error(
				`Failed to process ${activeTab === "upload" ? "PDF" : "text content"}`
			);
		} finally {
			clearInterval(progressInterval);
			setIsUploading(false);
		}
	};

	return (
		<div className="container max-w-md mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle>Upload Content</CardTitle>
					<CardDescription>
						Upload a PDF or paste text to generate a comprehensive summary
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs
						value={activeTab}
						onValueChange={(value) => setActiveTab(value as "upload" | "paste")}
					>
						<TabsList className="grid w-full grid-cols-2 mb-6">
							<TabsTrigger value="upload">Upload PDF</TabsTrigger>
							<TabsTrigger value="paste">Paste Text</TabsTrigger>
						</TabsList>

						<TabsContent value="upload">
							<form onSubmit={handleSubmit}>
								<div className="grid w-full items-center gap-4">
									<div className="flex flex-col space-y-1.5">
										<div
											className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
												file
													? "border-primary bg-primary/10"
													: "border-muted-foreground hover:border-primary"
											}`}
											onClick={() =>
												document.getElementById("pdf-upload")?.click()
											}
										>
											{file ? (
												<div className="flex flex-col items-center">
													<FileText className="w-8 h-8 mb-2 text-primary" />
													<p className="text-sm font-medium">{file.name}</p>
													<p className="text-xs text-muted-foreground mt-1">
														{(file.size / 1024 / 1024).toFixed(2)} MB
													</p>
												</div>
											) : (
												<div className="flex flex-col items-center">
													<Upload className="w-8 h-8 mb-2 text-muted-foreground" />
													<p className="text-sm font-medium">
														Click to upload PDF
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														PDF files only, up to 10MB
													</p>
												</div>
											)}
											<input
												id="pdf-upload"
												type="file"
												accept="application/pdf"
												className="hidden"
												onChange={handleFileChange}
												disabled={isUploading}
											/>
										</div>
									</div>
								</div>
							</form>
						</TabsContent>

						<TabsContent value="paste">
							<div className="flex flex-col space-y-1.5">
								<div className="border rounded-lg p-2">
									<div className="flex items-center mb-2">
										<Type className="w-5 h-5 mr-2 text-muted-foreground" />
										<p className="text-sm font-medium">Paste your text below</p>
									</div>
									<Textarea
										placeholder="Enter or paste your text here..."
										className="min-h-40 resize-y"
										value={textContent}
										onChange={handleTextChange}
										disabled={isUploading}
									/>
								</div>
							</div>
						</TabsContent>
					</Tabs>

					{isUploading && (
						<div className="mt-4">
							<div className="text-xs text-muted-foreground mb-1 flex justify-between">
								<span>Processing content...</span>
								<span>{uploadProgress}%</span>
							</div>
							<div className="w-full bg-secondary rounded-full h-2">
								<div
									className="bg-primary h-2 rounded-full transition-all duration-300"
									style={{ width: `${uploadProgress}%` }}
								></div>
							</div>
							<div className="text-xs text-muted-foreground mt-2 flex items-center">
								<AlertCircle className="w-3 h-3 mr-1" />
								Please don&apos;t close this window during processing
							</div>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline" onClick={() => router.push("/learn")}>
						Cancel
					</Button>
					<Button
						type="submit"
						onClick={handleSubmit}
						disabled={
							(activeTab === "upload" && !file) ||
							(activeTab === "paste" && !textContent.trim()) ||
							isUploading
						}
					>
						{isUploading ? "Processing..." : "Generate Summary"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
