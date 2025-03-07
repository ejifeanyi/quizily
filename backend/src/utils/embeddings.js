import { MistralAIEmbeddings } from "@langchain/mistralai";
import { loadEnv } from "../config/environment.js";

// Load environment variables
const env = loadEnv();

// Create a single instance of embeddings
let embeddingsInstance;

export function getEmbeddings() {
	if (!embeddingsInstance) {
		embeddingsInstance = new MistralAIEmbeddings({
			apiKey: env.MISTRAL_API_KEY, // Use Mistral API key
			model: "mistral-embed", // Mistral embeddings model
		});
	}
	return embeddingsInstance;
}


