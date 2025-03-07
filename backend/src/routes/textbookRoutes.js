import express from "express";
import { fileUpload } from "../middleware/fileUpload.js";
import { uploadTextbook } from "../controllers/textbookController.js";

const router = express.Router();

router.post("/upload", fileUpload, uploadTextbook);

export default router;
