// src/api/controllers/textbookController.js
import { saveVectorData } from "../services/vectorProcessingService.js";
import { prisma } from "../models/prisma.js";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function uploadTextbook(req, res, next) {
	try {
		console.log("req.file:", req.file);
		console.log("req.body:", req.body);

		if (!req.file && !req.body.text) {
			return res.status(400).json({ error: "No file or text provided" });
		}

		const userId = req.body.userId;
		if (!userId) {
			return res.status(400).json({ error: "User ID is required" });
		}

		let extractedText;
		if (req.file) {
			// Process PDF file
			console.log("Processing PDF file...");
			const dataBuffer = req.file.buffer;
			const data = await pdf(dataBuffer);
			extractedText = data.text;
			console.log("PDF text extracted successfully.");
		} else {
			// Process plain text
			console.log("Processing plain text...");
			extractedText = req.body.text;
		}

		console.log("Extracted text:", extractedText.substring(0, 200) + "..."); // Log preview of text

		// Save the extracted text to the database
		console.log("Saving textbook to database...");
		const textbook = await prisma.textbook.create({
			data: {
				title: req.body.title || "Untitled Textbook",
				content: extractedText,
				userId: userId,
			},
		});
		console.log("Textbook saved with ID:", textbook.id);

		// Respond immediately
		res.status(200).json({
			message: "File uploaded successfully",
			textbookId: textbook.id,
			text: extractedText.substring(0, 200) + "...", // Send preview of text
		});

		// Process textbook with vector embeddings in the background
		console.log("Starting background processing...");
		try {
			// Split the text into smaller chunks
			const textSplitter = new RecursiveCharacterTextSplitter({
				chunkSize: 4000, // Adjust based on token limit (1 token ≈ 4 characters)
				chunkOverlap: 200, // Overlap to maintain context
			});

			const textChunks = await textSplitter.splitText(extractedText);

			// Create documents with metadata
			const documents = textChunks.map((chunk, i) => ({
				pageContent: chunk,
				metadata: { source: `chunk-${i}`, index: i },
			}));

			console.log("Text split into", documents.length, "chunks.");

			// Save chunks to the database
			await saveVectorData(textbook.id, { documents }, prisma);
			console.log("Chunks saved to database.");
		} catch (error) {
			console.error("Error in background processing:", error);
		}
	} catch (error) {
		console.error("Error in uploadTextbook:", error);
		next(error);
	}
}
