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
    origin: [
      "https://formulaires-tcvcm.ca",
      "https://form-test-plum.vercel.app",
    ],
    credentials: true,
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

app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

export default app;
//
