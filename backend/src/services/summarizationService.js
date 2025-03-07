import { getLLMChain } from "../utils/aiClient.js";
import { PromptTemplate } from "@langchain/core/prompts";

export async function generateVectorBasedSummary(processedData) {
	const { documents } = processedData;

	// Create chapter-level summaries first
	const chapterSize = 5; // Number of chunks per "chapter"
	const chapters = [];

	for (let i = 0; i < documents.length; i += chapterSize) {
		const chapterDocs = documents.slice(i, i + chapterSize);
		const chapterText = chapterDocs.map((doc) => doc.pageContent).join("\n\n");

		// Summarize each chapter
		const chapterSummaryPrompt = new PromptTemplate({
			template: `Summarize the following section of a textbook. Include all key concepts, definitions, and important information:

      {text}
      
      DETAILED SECTION SUMMARY:`,
			inputVariables: ["text"],
		});

		const chapterSummaryChain = getLLMChain(chapterSummaryPrompt);
		const chapterSummaryResult = await chapterSummaryChain.call({
			text: chapterText,
		});
		chapters.push(chapterSummaryResult.text);
	}

	// Create overall summary from chapter summaries
	const finalSummaryPrompt = new PromptTemplate({
		template: `You are an AI academic assistant creating a comprehensive textbook summary.
    The following are summaries of individual sections from a textbook.
    
    Create a cohesive, well-structured overall summary that combines these section summaries.
    Organize with clear headings, bullet points for key concepts, and ensure all important information is included.
    Format the summary in a way that would be most helpful for a student studying this material.
    
    SECTION SUMMARIES:
    {combinedText}
    
    COMPREHENSIVE TEXTBOOK SUMMARY:`,
		inputVariables: ["combinedText"],
	});

	const finalSummaryChain = getLLMChain(finalSummaryPrompt);
	const result = await finalSummaryChain.call({
		combinedText: chapters.join("\n\n---\n\n"),
	});

	return result.text;
}
