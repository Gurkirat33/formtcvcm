import { createServer } from "http";
import connectDb from "../lib/connectDb.js";
import app from "../app.js";

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await connectDb();
      isConnected = true;
      console.log("MongoDB Connected (Vercel)");
    } catch (err) {
      console.error("Mongo Error", err);
      res.statusCode = 500;
      return res.end("DB connection error");
    }
  }

  const server = createServer(app);
  server.emit("request", req, res);
}
