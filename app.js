import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import adminRoutes from "./routes/admin.routes.js";
import eventRoutes from "./routes/event.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:3000",
        "https://formtcvcm.vercel.app", // Add your Vercel domain
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins in production
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["user-logged-in"],
  })
);

app.use(express.static(path.join(__dirname, "..")));

app.get("/event-details.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "event-details.html"));
});

app.get("/profile.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "profile.html"));
});

app.get("/test", (req, res) => {
  return res.json({ message: "test" });
});

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: "Internal Server Error",
    error:
      process.env.NODE_ENV === "production" ? "An error occurred" : err.message,
  });
});

export default app;
//
