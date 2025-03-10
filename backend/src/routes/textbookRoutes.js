import express from "express";
import { fileUpload } from "../middleware/fileUpload.js";
import { authenticate } from "../middleware/auth.js";
import { uploadTextbook } from "../controllers/textbookController.js";

const router = express.Router();

router.post("/upload", authenticate, fileUpload, uploadTextbook);

export default router;
