import express from "express";
import { getRecommendations } from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/:quizId", getRecommendations);

export default router;

