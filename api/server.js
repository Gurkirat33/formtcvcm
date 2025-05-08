import { createServer } from "http";
import connectDb from "../lib/connectDb.js";
import app from "../app.js";
import mongoose from "mongoose";

let cachedDb = null;
let isConnecting = false;
let connectionAttempts = 0;
const MAX_ATTEMPTS = 3;

export default async function handler(req, res) {
  if (req.url === "/test") {
    const server = createServer(app);
    return server.emit("request", req, res);
  }

  if (!cachedDb) {
    if (!isConnecting) {
      isConnecting = true;
      connectionAttempts++;

      try {
        const connectPromise = connectDb();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 5000)
        );

        await Promise.race([connectPromise, timeoutPromise]);
        cachedDb = true;
        console.log("MongoDB Connected (Vercel)");
      } catch (err) {
        console.error(
          `MongoDB Connection Error (Attempt ${connectionAttempts}/${MAX_ATTEMPTS}):`,
          err
        );
        isConnecting = false;

        if (connectionAttempts >= MAX_ATTEMPTS) {
          res.statusCode = 500;
          return res.end("Database connection failed after multiple attempts");
        }

        if (req.url.startsWith("/api/")) {
          res.statusCode = 503;
          return res.end("Database connection error. Please try again later.");
        }
      }
      isConnecting = false;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!cachedDb && req.url.startsWith("/api/")) {
        res.statusCode = 503;
        return res.end("Database connection in progress. Please try again.");
      }
    }
  }

  const server = createServer(app);
  server.emit("request", req, res);
}
