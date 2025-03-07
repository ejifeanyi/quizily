import { prisma } from "../models/prisma.js";

export async function getRecommendations(req, res, next) {
	try {
		const { quizId } = req.params;

		// Fetch the quiz results
		const quizResult = await prisma.quizResult.findUnique({
			where: { id: quizId },
			include: { quiz: true },
		});

		if (!quizResult) {
			return res.status(404).json({ error: "Quiz result not found" });
		}

		// Analyze incorrect answers and recommend textbook sections
		const incorrectAnswers = quizResult.answers.filter(
			(answer) => !answer.isCorrect
		);

		const recommendations = incorrectAnswers.map((answer) => {
			return {
				question: answer.questionText,
				recommendedSection: `Chapter ${answer.chapterIndex}`, // Add logic to map to textbook sections
			};
		});

		res.status(200).json({
			recommendations,
		});
	} catch (error) {
		next(error);
	}
}
