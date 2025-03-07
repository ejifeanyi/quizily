import dotenv from "dotenv";
import { createServer } from "http";
import { app } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = createServer(app);

server.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
});
