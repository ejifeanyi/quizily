import { getEmbeddings } from "../utils/embeddings.js";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export async function createVectorStore(documents) {
	const embeddings = getEmbeddings();
	return await MemoryVectorStore.fromDocuments(documents, embeddings);
}

export async function saveVectorData(textbookId, processedData, prisma) {
	const { documents } = processedData;

	// Store document chunks with their metadata
	const chunks = documents.map((doc) => ({
		content: doc.pageContent,
		metadata: doc.metadata,
	}));

	// Save to database
	await prisma.textbookChunk.createMany({
		data: chunks.map((chunk) => ({
			textbookId,
			content: chunk.content,
			metadata: chunk.metadata,
			index: chunk.metadata.index,
		})),
	});
}
