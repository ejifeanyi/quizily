import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.memoryStorage();
const limits = { fileSize: 25 * 1024 * 1024 }; // 25MB limit

const fileFilter = (req, file, cb) => {
	if (file.mimetype === "application/pdf") {
		cb(null, true);
	} else {
		cb(new Error("Only PDF files are allowed"), false);
	}
};

export const fileUpload = multer({
	storage,
	limits,
	fileFilter,
}).single("file");
