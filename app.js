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

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:3000",
      ];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
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

app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

export default app;
