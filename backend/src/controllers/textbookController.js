// src/api/controllers/textbookController.js
import { saveVectorData } from "../services/vectorProcessingService.js";
import { prisma } from "../models/prisma.js";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { generateVectorBasedSummary } from "../services/summarizationService.js";

export async function uploadTextbook(req, res, next) {
	try {
		if (!req.file && !req.body.text) {
			return res.status(400).json({ error: "No file or text provided" });
		}

		const userId = req.user.userId;
		if (!userId) {
			return res.status(400).json({ error: "User ID is required" });
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		let extractedText;
		if (req.file) {
			const dataBuffer = req.file.buffer;
			const data = await pdf(dataBuffer);
			extractedText = data.text;
		} else {
			extractedText = req.body.text;
		}

		const title =
			extractedText.split("\n")[0].substring(0, 100) || "Untitled Textbook";

		const textbook = await prisma.textbook.create({
			data: {
				title: title,
				content: extractedText,
				userId: userId,
			},
		});

		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 4000,
			chunkOverlap: 200,
		});

		const textChunks = await textSplitter.splitText(extractedText);

		const documents = textChunks.map((chunk, i) => ({
			pageContent: chunk,
			metadata: { source: `chunk-${i}`, index: i },
		}));

		await saveVectorData(textbook.id, { documents }, prisma);

		const summary = await generateVectorBasedSummary({ documents });

		const savedSummary = await prisma.summary.create({
			data: {
				content: summary,
				textbookId: textbook.id,
				userId: userId,
			},
		});

		res.status(200).json({
			message: "File uploaded and summary generated successfully",
			textbookId: textbook.id,
			summaryId: savedSummary.id,
			summary: summary,
		});
	} catch (error) {
		console.error("Error in uploadTextbook:", error);
		next(error);
	}
}
