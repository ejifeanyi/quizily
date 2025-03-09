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
	questions: string; // Raw text from the model, need to parse
}

// Parsed question structure
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

				// First check if quiz already exists
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
					setQuizData(data);
					const questions = parseQuizQuestions(data.questions);
					setParsedQuestions(questions);
				} else {
					// Quiz doesn't exist yet, we'll need to generate one
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
			setQuizData(data);

			const questions = parseQuizQuestions(data.questions);
			setParsedQuestions(questions);
		} catch (error) {
			console.error("Error generating quiz:", error);
			toast.error("Failed to generate quiz. Please try again.");
		} finally {
			setGenerating(false);
		}
	};

	// Function to parse the quiz questions text into structured data
	const parseQuizQuestions = (questionsText: string): Question[] => {
		// This is a simplified parsing logic - you may need to adjust based on
		// the exact format returned by your AI model

		const questions: Question[] = [];

		// Split by question numbers 1., 2., etc.
		const questionBlocks = questionsText.split(/\n\s*\d+\.\s+/).filter(Boolean);

		questionBlocks.forEach((block, index) => {
			const lines = block.split("\n").filter((line) => line.trim() !== "");

			// First line is the question
			const questionText = lines[0];

			const options: { id: string; text: string; isCorrect: boolean }[] = [];
			let answerLine = "";

			// Extract options and answer
			lines.slice(1).forEach((line) => {
				if (line.match(/^[a-d]\)\s+/) || line.match(/^[a-d]\.\s+/)) {
					// This is an option
					const optionId = line.substring(0, 1);
					const optionText = line
						.substring(
							line.indexOf(")") !== -1
								? line.indexOf(")") + 1
								: line.indexOf(".") + 1
						)
						.trim();

					options.push({
						id: optionId,
						text: optionText,
						isCorrect: false,
					});
				} else if (
					line.toLowerCase().includes("answer:") ||
					line.toLowerCase().includes("correct answer:") ||
					line.toLowerCase().includes("correct:")
				) {
					answerLine = line;
				}
			});

			// Mark the correct answer
			if (answerLine) {
				// Extract the answer letter (a, b, c, d)
				const match = answerLine.match(/[a-d](?:\)|\.|\s|$)/i);
				if (match) {
					const correctAnswer = match[0].substring(0, 1).toLowerCase();

					// Find and mark the correct option
					const correctOption = options.find(
						(opt) => opt.id.toLowerCase() === correctAnswer
					);
					if (correctOption) {
						correctOption.isCorrect = true;
					}
				}
			}

			questions.push({
				id: `q${index + 1}`,
				text: questionText,
				options: options,
			});
		});

		return questions;
	};

	const handleOptionSelect = (questionId: string, optionId: string) => {
		setSelectedOptions((prev) => ({
			...prev,
			[questionId]: optionId,
		}));
	};

	const handleNext = () => {
		if (currentQuestionIndex < parsedQuestions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		} else {
			calculateScore();
			setShowResults(true);
		}
	};

	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const calculateScore = () => {
		if (!parsedQuestions.length) return;

		let correctAnswers = 0;
		parsedQuestions.forEach((question) => {
			const selectedOption = selectedOptions[question.id];
			const correctOption = question.options.find((opt) => opt.isCorrect);

			if (correctOption && selectedOption === correctOption.id) {
				correctAnswers++;
			}
		});

		setScore(correctAnswers);
	};

	const handleReturnToSummary = () => {
		router.push(`/learn/${summaryId}`);
	};

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

	if (!quizData || !parsedQuestions.length) {
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
										<p className="font-medium mb-2">
											{index + 1}. {question.text}
										</p>
										<p className="text-sm">
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
											<p className="text-sm mt-1">
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

	if (currentQuestionIndex >= parsedQuestions.length) {
		return null;
	}

	const currentQuestion = parsedQuestions[currentQuestionIndex];

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
