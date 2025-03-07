// src/api/routes/quizRoutes.js
import express from "express";
import { generateQuiz } from "../controllers/quizController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/generate", authenticate, generateQuiz);

export default router;
