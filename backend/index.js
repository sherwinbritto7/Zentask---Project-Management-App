// fix dns error only in development
if (process.env.NODE_ENV !== "production") {
  try {
    const dns = await import("node:dns/promises");
    dns.default.setServers(["1.1.1.1", "1.0.0.1"]);
  } catch (e) {
    console.warn("DNS override failed, skipping...");
  }
}

import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { json } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import routes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL === "*" ? "*" : (process.env.FRONTEND_URL || "http://localhost:5173"),
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json());

// db connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log("Failed to connect to DB:", err));

const PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to ZenTask API",
  });
});

// http:localhost:5000/api-v1/
app.use("/api-v1", routes);

// error middleware
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    message: "Internal server error",
  });
});

//not found middleware
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Sever running on port ${PORT}`);
  });
}

export default app;
