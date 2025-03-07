import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Create a reusable text splitter
export const textSplitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 200,
});
