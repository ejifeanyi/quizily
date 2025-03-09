"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface QuizProps {
	summaryId: string;
}

interface QuizData {
	quizId: string;
	questions: string;
}

interface Question {
	id: string;
	text: string;
	options: {
		id: string;
		text: string;
		isCorrect: boolean;
	}[];
}

export default function Quiz({ summaryId }: QuizProps) {
	const [quizData, setQuizData] = useState<QuizData | null>(null);
	const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [generating, setGenerating] = useState<boolean>(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedOptions, setSelectedOptions] = useState<
		Record<string, string>
	>({});
	const [showResults, setShowResults] = useState(false);
	const [score, setScore] = useState(0);
	const router = useRouter();

	useEffect(() => {
		const fetchQuiz = async () => {
			if (!summaryId) return;

			try {
				setLoading(true);
				console.log("Checking for existing quiz for summary ID:", summaryId);

				const token = localStorage.getItem("token");
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/quiz/summaries/${summaryId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.ok) {
					const data = await response.json();
					console.log("Fetched quiz data:", data);
					setQuizData(data);
					const questions = parseQuizQuestions(data.questions);
					console.log("Parsed questions:", questions);
					setParsedQuestions(questions);
				} else {
					console.log("No existing quiz found, generating new quiz");
					setGenerating(true);
					await generateQuiz();
				}
			} catch (error) {
				console.error("Error fetching quiz:", error);
				toast.error("Failed to load quiz. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchQuiz();
	}, [summaryId]);

	const generateQuiz = async () => {
		try {
			setGenerating(true);
			const token = localStorage.getItem("token");
			console.log("Generating new quiz for summary ID:", summaryId);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/quiz/generate`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ summaryId }),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to generate quiz");
			}

			const data = await response.json();
			console.log("Generated quiz data:", data);
			setQuizData(data);

			const questions = parseQuizQuestions(data.questions);
			console.log("Parsed generated questions:", questions);
			setParsedQuestions(questions);
		} catch (error) {
			console.error("Error generating quiz:", error);
			toast.error("Failed to generate quiz. Please try again.");
		} finally {
			setGenerating(false);
		}
	};

	const parseQuizQuestions = (questionsText: string): Question[] => {
		console.log("Raw quiz data to parse:", questionsText);
		const questions: Question[] = [];

		// Split the text into individual questions using the number pattern (e.g., "1.", "2.", etc.)
		const questionBlocks = questionsText.split(/\d+\.\s+/).filter(Boolean);

		questionBlocks.forEach((block, index) => {
			const question = parseQuestionBlock(block.trim(), index);
			if (question) {
				questions.push(question);
			}
		});

		console.log(`Final parsed questions (${questions.length}):`, questions);
		return questions;
	};

	// Fixed parsing function
	function parseQuestionBlock(block: string, index: number): Question | null {
		console.log(`Processing question block ${index + 1}:`, block);

		// Split into lines
		const lines = block
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);

		if (lines.length < 3) {
			console.warn(`Question block ${index + 1} has insufficient content`);
			return null;
		}

		// Extract question text (first line)
		const questionText = lines[0]
			.replace(/^\*\*/, "")
			.replace(/\*\*$/, "")
			.trim();
		console.log(`Question ${index + 1} text: "${questionText}"`);

		// Extract options and answer
		const options: { id: string; text: string; isCorrect: boolean }[] = [];
		let correctAnswer = "";

		// Look for the correct answer first
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.includes("**Correct Answer:")) {
				const answerMatch = line.match(/\*\*Correct Answer:\s*([A-D])\*\*/i);
				if (answerMatch) {
					correctAnswer = answerMatch[1].toLowerCase();
					console.log(`Found correct answer: ${correctAnswer}`);
				}
			}
		}

		// Extract options
		for (let i = 1; i < lines.length; i++) {
			const line = lines[i];

			// Match options like "- A. text" or "- A text"
			const optionMatch = line.match(/^-\s*([A-D])\.?\s*(.*)/i);
			if (optionMatch) {
				const optionId = optionMatch[1].toLowerCase();
				let optionText = optionMatch[2].trim();

				// Remove any potential markdown formatting
				optionText = optionText.replace(/\*\*/g, "");

				console.log(`Found option ${optionId}: "${optionText}"`);

				options.push({
					id: optionId,
					text: optionText,
					isCorrect: optionId.toLowerCase() === correctAnswer.toLowerCase(),
				});
			}
		}

		// If we didn't find a correct answer mark, check if any option is marked as correct
		if (!correctAnswer && options.length > 0) {
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				for (const option of options) {
					if (
						line.includes(`**${option.id.toUpperCase()}**`) ||
						line.includes(`**${option.id.toUpperCase()}.**`)
					) {
						option.isCorrect = true;
						correctAnswer = option.id;
						console.log(`Found option ${option.id} marked as correct in text`);
						break;
					}
				}
				if (correctAnswer) break;
			}
		}

		// If still no correct answer found, default to first option
		if (!correctAnswer && options.length > 0) {
			options[0].isCorrect = true;
			console.log(`No correct answer identified, defaulting to first option`);
		}

		// Only return a question if we have options
		if (options.length > 0) {
			return {
				id: `q${index + 1}`,
				text: questionText,
				options: options,
			};
		}

		console.warn(`Question ${index + 1} has no valid options, skipping`);
		return null;
	}

	const handleOptionSelect = (questionId: string, optionId: string) => {
		console.log(`Selected option ${optionId} for question ${questionId}`);
		setSelectedOptions((prev) => ({
			...prev,
			[questionId]: optionId,
		}));
	};

	const handleNext = () => {
		if (currentQuestionIndex < parsedQuestions.length - 1) {
			console.log(`Moving to question ${currentQuestionIndex + 2}`);
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		} else {
			console.log("Quiz completed, calculating score");
			calculateScore();
			setShowResults(true);
		}
	};

	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			console.log(`Moving back to question ${currentQuestionIndex}`);
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const calculateScore = () => {
		if (!parsedQuestions.length) return;

		let correctAnswers = 0;
		const results = [];

		parsedQuestions.forEach((question) => {
			const selectedOption = selectedOptions[question.id];
			const correctOption = question.options.find((opt) => opt.isCorrect);
			const isCorrect = correctOption && selectedOption === correctOption.id;

			if (isCorrect) {
				correctAnswers++;
			}

			results.push({
				question: question.text,
				selectedOption:
					question.options.find((opt) => opt.id === selectedOption)?.text ||
					"Not answered",
				correctOption: correctOption?.text || "Unknown",
				isCorrect,
			});
		});

		console.log("Quiz results:", {
			totalQuestions: parsedQuestions.length,
			correctAnswers,
			score: `${correctAnswers}/${parsedQuestions.length}`,
			percentage: Math.round((correctAnswers / parsedQuestions.length) * 100),
			detailedResults: results,
		});

		setScore(correctAnswers);
	};

	const handleReturnToSummary = () => {
		console.log("Returning to summary page");
		router.push(`/learn/${summaryId}`);
	};

	// Check if we have valid quiz data
	if (!summaryId) {
		console.log("No summary ID provided");
		return null;
	}

	if (loading || generating) {
		return (
			<div className="flex justify-center p-6">
				<div className="text-center">
					<div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-sm text-muted-foreground">
						{generating ? "Generating quiz questions..." : "Loading quiz..."}
					</p>
				</div>
			</div>
		);
	}

	// Debug info about the current state
	console.log("Current state:", {
		quizDataExists: !!quizData,
		questionsCount: parsedQuestions.length,
		currentQuestionIndex,
		selectedOptionsCount: Object.keys(selectedOptions).length,
	});

	if (!quizData || parsedQuestions.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-6 space-y-4">
				<p className="text-sm text-muted-foreground">
					Could not load or generate quiz
				</p>
				<div className="flex space-x-4">
					<Button variant="outline" onClick={handleReturnToSummary}>
						Return to Summary
					</Button>
					<Button onClick={generateQuiz}>Try Again</Button>
				</div>
			</div>
		);
	}

	if (showResults) {
		return (
			<div className="max-w-2xl mx-auto p-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl text-center">Quiz Results</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="text-center">
							<div className="text-3xl font-bold mb-2">
								{score} / {parsedQuestions.length}
							</div>
							<p className="text-muted-foreground">
								{Math.round((score / parsedQuestions.length) * 100)}% Correct
							</p>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-medium">Question Summary:</h3>
							{parsedQuestions.map((question, index) => {
								const selectedOption = selectedOptions[question.id];
								const correctOption = question.options.find(
									(opt) => opt.isCorrect
								);
								const isCorrect =
									correctOption && selectedOption === correctOption.id;

								return (
									<div
										key={question.id}
										className={`p-4 rounded-lg ${
											isCorrect
												? "bg-green-50 border border-green-200"
												: "bg-red-50 border border-red-200"
										}`}
									>
										<p className="font-medium mb-2 text-secondary">
											{index + 1}. {question.text}
										</p>
										<p className="text-sm text-secondary">
											Your answer:{" "}
											<span
												className={
													isCorrect
														? "text-green-600 font-medium"
														: "text-red-600 font-medium"
												}
											>
												{question.options.find(
													(opt) => opt.id === selectedOption
												)?.text || "Not answered"}
											</span>
										</p>
										{!isCorrect && correctOption && (
											<p className="text-sm mt-1 text-secondary">
												Correct answer:{" "}
												<span className="text-green-600 font-medium">
													{correctOption.text}
												</span>
											</p>
										)}
									</div>
								);
							})}
						</div>
					</CardContent>
					<CardFooter className="flex justify-center">
						<Button onClick={handleReturnToSummary}>Return to Summary</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// Make sure we have a valid current question index
	if (currentQuestionIndex >= parsedQuestions.length) {
		console.error(
			"Invalid question index:",
			currentQuestionIndex,
			"max:",
			parsedQuestions.length - 1
		);
		setCurrentQuestionIndex(0);
		return null;
	}

	const currentQuestion = parsedQuestions[currentQuestionIndex];
	console.log("Current question:", currentQuestion);

	return (
		<div className="max-w-2xl mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Quiz</CardTitle>
					<div className="text-sm text-muted-foreground">
						Question {currentQuestionIndex + 1} of {parsedQuestions.length}
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div>
							<h3 className="text-lg font-medium mb-4">
								{currentQuestion.text}
							</h3>

							<RadioGroup
								value={selectedOptions[currentQuestion.id] || ""}
								onValueChange={(value) =>
									handleOptionSelect(currentQuestion.id, value)
								}
								className="space-y-3"
							>
								{currentQuestion.options.map((option) => (
									<div key={option.id} className="flex items-center space-x-2">
										<RadioGroupItem
											value={option.id}
											id={`${currentQuestion.id}-${option.id}`}
										/>
										<Label
											htmlFor={`${currentQuestion.id}-${option.id}`}
											className="flex-grow cursor-pointer"
										>
											{option.text}
										</Label>
									</div>
								))}
							</RadioGroup>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button
						variant="outline"
						onClick={handlePrevious}
						disabled={currentQuestionIndex === 0}
					>
						Previous
					</Button>
					<Button
						onClick={handleNext}
						disabled={!selectedOptions[currentQuestion.id]}
					>
						{currentQuestionIndex < parsedQuestions.length - 1
							? "Next"
							: "Finish"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
