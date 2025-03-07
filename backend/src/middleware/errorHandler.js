export default function errorHandler(err, req, res, next) {
	console.error("API Error:", err);

	// Customize error responses based on error type
	if (err instanceof multer.MulterError) {
		return res.status(400).json({
			error: "File upload error",
			details: err.message,
		});
	}

	if (err.name === "ValidationError") {
		return res.status(400).json({
			error: "Validation error",
			details: err.message,
		});
	}

	// Default error
	return res.status(err.status || 500).json({
		error: err.message || "Internal server error",
	});
}
