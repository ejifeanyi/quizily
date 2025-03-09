import express from "express";
import { generateSummary } from "../controllers/summaryController.js";
import { prisma } from "../models/prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/generate", generateSummary);

router.get("/summaries", authenticate, async (req, res) => {
	try {
		const userId = req.user.userId;

		const summaries = await prisma.summary.findMany({
			where: {
				userId: userId,
			},
			include: {
				textbook: true,
			},
		});

		res.status(200).json(summaries);
	} catch (error) {
		console.error("Error fetching summaries:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.get("/summary/:id", authenticate, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.userId;

		const summary = await prisma.summary.findUnique({
			where: { id },
			include: {
				textbook: true,
			},
		});

		if (!summary || summary.userId !== userId) {
			return res.status(404).json({ error: "Summary not found" });
		}

		res.status(200).json(summary);
	} catch (error) {
		console.error("Error fetching summary:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
