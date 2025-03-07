import { ChatMistralAI } from "@langchain/mistralai";
import { LLMChain } from "langchain/chains";
import { loadEnv } from "../config/environment.js";

// Load environment variables
const env = loadEnv();

// Initialize LLM model
let model;

export function getAIModel() {
	if (!model) {
		model = new ChatMistralAI({
			apiKey: env.MISTRAL_API_KEY,
			temperature: 0.3,
			modelName: "mistral-small-latest",
		});
	}
	return model;
}

export function getLLMChain(prompt) {
	return new LLMChain({
		llm: getAIModel(),
		prompt: prompt,
	});
}
