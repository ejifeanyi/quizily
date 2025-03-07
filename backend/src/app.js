import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import textbookRoutes from "./routes/textbookRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/textbook", textbookRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/recommendation", recommendationRoutes);
app.use("/api/summary", summaryRoutes);

// Health Check
app.get("/", (req, res) => {
	res.json({ message: "Welcome to the Quizily" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Something went wrong!" });
});

export { app, prisma };
