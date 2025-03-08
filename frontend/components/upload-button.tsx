"use client";

import { useState } from "react";
import axios from "axios";
import { Send, UploadIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Upload({
	onUploadSuccess,
}: {
	onUploadSuccess: (summary: string) => void;
}) {
	const [text, setText] = useState<string>("");
	const [file, setFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0];
			setFile(selectedFile);
			toast.success(`File selected: ${selectedFile.name}`);
		}
	};

	const handleSubmit = async () => {
		if (!text && !file) {
			toast.error("Please provide text or upload a PDF file.");
			return;
		}

		setIsLoading(true);

		const formData = new FormData();
		if (file) formData.append("file", file);
		if (text) formData.append("text", text);
		formData.append("userId", "actual-user-id");

		try {
			const token = localStorage.getItem("token");
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/textbook/upload`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			console.log("Summary:", response.data.summary);
			onUploadSuccess(response.data.summary);
			toast.success("File uploaded and summary generated successfully.");
		} catch (error) {
			console.error("Error uploading file:", error);
			toast.error("Failed to upload file. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center gap-2 p-4 border rounded-lg bg-background">
			{/* PDF Upload Button */}
			<label className="cursor-pointer">
				<input
					type="file"
					accept=".pdf"
					className="hidden"
					onChange={handleFileChange}
					id="file-upload"
				/>
				<Button
					variant="ghost"
					size="icon"
					disabled={isLoading}
					onClick={() => document.getElementById("file-upload")?.click()}
				>
					<UploadIcon className="h-5 w-5" />
				</Button>
			</label>

			<Input
				type="text"
				placeholder="Enter text or upload a PDF..."
				value={text}
				onChange={(e) => setText(e.target.value)}
				className="flex-1"
				disabled={isLoading}
			/>

			<Button
				variant="default"
				size="icon"
				onClick={handleSubmit}
				disabled={isLoading}
			>
				<Send className="h-5 w-5" />
			</Button>
		</div>
	);
}
