import { generateVectorBasedSummary } from "../services/summarizationService.js";
import { prisma } from "../models/prisma.js";

export async function generateSummary(req, res, next) {
	try {
		const { textbookId, userId } = req.body;

		if (!textbookId || !userId) {
			return res.status(400).json({
				error: "Textbook ID and User ID are required",
			});
		}

		// Fetch the textbook content and its chunks
		const textbook = await prisma.textbook.findUnique({
			where: { id: textbookId },
			include: {
				chunks: {
					orderBy: {
						index: "asc",
					},
				},
			},
		});

		if (!textbook) {
			return res.status(404).json({ error: "Textbook not found" });
		}

		// Use the pre-split chunks from the database
		const documents = textbook.chunks.map((chunk) => ({
			pageContent: chunk.content,
			metadata: chunk.metadata,
		}));

		// Generate the summary
		console.log("Generating summary...");
		const summary = await generateVectorBasedSummary({ documents });
		console.log("Summary generated successfully.");

		// Save the summary to the database
		const savedSummary = await prisma.summary.create({
			data: {
				content: summary,
				textbookId: textbookId,
				userId: userId,
			},
		});

		res.status(200).json({
			summaryId: savedSummary.id,
			summary: summary,
		});
	} catch (error) {
		console.error("Error in generateSummary:", error);
		next(error);
	}
}
