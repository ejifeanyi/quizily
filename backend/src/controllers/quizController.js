import { PromptTemplate } from "@langchain/core/prompts";
import { prisma } from "../models/prisma.js";
import { getLLMChain } from "../utils/aiClient.js";

export async function generateQuiz(req, res, next) {
	try {
		const { summaryId } = req.body;

		// Fetch the summary
		const summary = await prisma.summary.findUnique({
			where: { id: summaryId },
		});

		if (!summary) {
			return res.status(404).json({ error: "Summary not found" });
		}

		// Generate quiz questions using Mistral AI
		const quizPrompt = new PromptTemplate({
			template: `Generate 5 quiz questions based on the following summary. Include multiple-choice answers and mark the correct answer.

      SUMMARY:
      {summary}
      
      QUIZ QUESTIONS:`,
			inputVariables: ["summary"],
		});

		const quizChain = getLLMChain(quizPrompt);
		const quizResult = await quizChain.call({
			summary: summary.content,
		});

		// Save the quiz to the database
		const quiz = await prisma.quiz.create({
			data: {
				questions: quizResult.text,
				summaryId: summaryId,
				userId: req.user.userId,
			},
		});

		res.status(200).json({
			quizId: quiz.id,
			questions: quizResult.text,
		});
	} catch (error) {
		next(error);
	}
}
