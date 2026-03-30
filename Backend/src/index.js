import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";
import { PORT, DB_NAME, MONGODB_URI } from "./constants.js";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
	res.json({ status: "ok", message: "Server running" });
});

const maskMongoUri = (uri) => {
	try {
		// remove credentials between // and @ if present
		return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^@]+@)/, "$1<redacted>@");
	} catch (e) {
		return uri;
	}
};

const start = async () => {
	const source = process.env.MONGODB_URI
		? "MONGODB_URI"
		: process.env.MONGODB_URL
		? "MONGODB_URL"
		: "default_local";

	console.log(`Starting server. Mongo source: ${source}`);
	console.log(`Connecting to MongoDB: ${maskMongoUri(MONGODB_URI)}/${DB_NAME}`);

	await connectDB();

	app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
};

start().catch((err) => {
	console.error("Failed to start app:", err);
	process.exit(1);
});
