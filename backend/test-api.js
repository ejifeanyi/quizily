import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

const BASE_URL = "http://localhost:5000/api";
const TEST_USER_ID = "test123";
const PDF_PATH = path.resolve("./sample.pdf");

// For testing with plain text instead of PDF
const TEXT_CONTENT = `
This is a sample textbook content for testing purposes.
It contains multiple paragraphs of information that can be processed.
The system should be able to handle this text input instead of a PDF file.
`;

// Verify file exists before attempting upload
function verifyFile(filePath) {
	if (!fs.existsSync(filePath)) {
		throw new Error(`File does not exist: ${filePath}`);
	}
	console.log(`File verified: ${filePath}`);
}

// Test upload with PDF file
async function testPdfUpload() {
	try {
		verifyFile(PDF_PATH);

		const form = new FormData();
		form.append("userId", TEST_USER_ID);
		form.append("title", "Test Textbook PDF");
		form.append("file", fs.createReadStream(PDF_PATH));

		console.log("Uploading test PDF...");
		const uploadResponse = await axios.post(
			`${BASE_URL}/textbook/upload`,
			form,
			{
				headers: {
					...form.getHeaders(),
				},
				timeout: 60000, // Increased timeout to 60 seconds
				maxContentLength: 25 * 1024 * 1024,
			}
		);

		console.log("PDF Upload successful:", uploadResponse.data);
		return uploadResponse.data.textbookId;
	} catch (error) {
		console.error("PDF Upload failed:");
		if (error.response) {
			console.error(
				"Server response:",
				error.response.status,
				error.response.data
			);
		} else if (error.request) {
			console.error("No response from server:", error.request._currentUrl);
		} else {
			console.error("Error message:", error.message);
		}
		throw error;
	}
}

// Test upload with plain text
async function testTextUpload() {
	try {
		const payload = {
			userId: TEST_USER_ID,
			title: "Test Textbook Text",
			text: TEXT_CONTENT,
		};

		console.log("Uploading test TEXT...");
		const uploadResponse = await axios.post(
			`${BASE_URL}/textbook/upload`,
			payload,
			{
				headers: {
					"Content-Type": "application/json",
				},
				timeout: 30000,
			}
		);

		console.log("Text Upload successful:", uploadResponse.data);
		return uploadResponse.data.textbookId;
	} catch (error) {
		console.error("Text Upload failed:");
		if (error.response) {
			console.error(
				"Server response:",
				error.response.status,
				error.response.data
			);
		} else if (error.request) {
			console.error("No response from server");
		} else {
			console.error("Error message:", error.message);
		}
		throw error;
	}
}

async function testSummarize(textbookId) {
	try {
		console.log(`Generating summary for textbook ${textbookId}...`);
		const summarizeResponse = await axios.post(
			`${BASE_URL}/textbook/summarize`,
			{
				textbookId,
				userId: TEST_USER_ID,
			},
			{
				timeout: 60000, // Summarization might take longer
			}
		);

		console.log(
			"Summary generated:",
			summarizeResponse.data.summary.substring(0, 100) + "..."
		);
		return summarizeResponse.data.summaryId;
	} catch (error) {
		console.error("Summarization failed:");
		if (error.response) {
			console.error(
				"Server response:",
				error.response.status,
				error.response.data
			);
		} else if (error.request) {
			console.error("No response received");
		} else {
			console.error("Error message:", error.message);
		}
		throw error;
	}
}

async function testQuiz(summaryId) {
	try {
		console.log(`Generating quiz for summary ${summaryId}...`);
		const quizResponse = await axios.post(
			`${BASE_URL}/textbook/quiz`,
			{
				summaryId,
				userId: TEST_USER_ID,
				questionCount: 3, // Smaller number for testing
			},
			{
				timeout: 60000,
			}
		);

		console.log(
			"Quiz generated with questions:",
			quizResponse.data.questions.length
		);
		return quizResponse.data.quizId;
	} catch (error) {
		console.error("Quiz generation failed:");
		if (error.response) {
			console.error(
				"Server response:",
				error.response.status,
				error.response.data
			);
		} else if (error.request) {
			console.error("No response received");
		} else {
			console.error("Error message:", error.message);
		}
		throw error;
	}
}

async function runTests() {
	try {
		console.log("Starting tests with server at:", BASE_URL);

		// Try text upload first as it's simpler
		let textbookId;
		try {
			console.log("TESTING TEXT UPLOAD...");
			textbookId = await testTextUpload();
		} catch (e) {
			console.log("Text upload failed, trying PDF upload...");
			textbookId = await testPdfUpload();
		}

		if (!textbookId) {
			throw new Error("Failed to get a valid textbookId");
		}

		console.log(`Successfully uploaded with textbookId: ${textbookId}`);

		// Continue with summarization
		const summaryId = await testSummarize(textbookId);
		console.log(`Successfully generated summary with summaryId: ${summaryId}`);

		// Generate quiz
		const quizId = await testQuiz(summaryId);
		console.log(`Successfully generated quiz with quizId: ${quizId}`);

		console.log("All tests completed successfully!");
	} catch (error) {
		console.error("Test sequence failed");
		process.exit(1);
	}
}

runTests();
