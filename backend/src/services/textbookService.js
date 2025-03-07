import { createVectorStore } from "./vectorProcessingService.js";
import { textSplitter } from "../utils/textProcessing.js";
import { Document } from "langchain/document";

export async function processTextbookContent(textContent) {
	// Split the text into manageable chunks
	const textChunks = await textSplitter.splitText(textContent);

	// Create documents with metadata
	const documents = textChunks.map(
		(chunk, i) =>
			new Document({
				pageContent: chunk,
				metadata: {
					source: `chunk-${i}`,
					index: i,
					keywords: [], // Add keywords for recommendations
				},
			})
	);

	// Create vector embeddings and store
	const vectorStore = await createVectorStore(documents);

	return {
		documents,
		vectorStore,
	};
}
