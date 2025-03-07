import dotenv from "dotenv";

let envCache;

export function loadEnv() {
	if (!envCache) {
		// Load environment variables from .env file
		dotenv.config();

		// Create a configuration object
		envCache = {
			NODE_ENV: process.env.NODE_ENV || "development",
			PORT: parseInt(process.env.PORT || "3000", 10),
			MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
			DATABASE_URL: process.env.DATABASE_URL,
			FILE_UPLOAD_SIZE_LIMIT:
				parseInt(process.env.FILE_UPLOAD_SIZE_LIMIT || "25", 10) * 1024 * 1024, // in MB
		};

		// Validate required environment variables
		const requiredVars = ["MISTRAL_API_KEY", "DATABASE_URL"];
		const missingVars = requiredVars.filter((varName) => !envCache[varName]);

		if (missingVars.length > 0) {
			throw new Error(
				`Missing required environment variables: ${missingVars.join(", ")}`
			);
		}
	}

	return envCache;
}
