import express from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getLatestEvents,
  registerForEvent,
  getUserRegisteredEvents,
  cancelEventRegistration,
} from "../controllers/event.controller.js";
import { verifyToken, verifyUserToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllEvents);
router.get("/latest", getLatestEvents);
router.get("/:id", getEventById);

router.post("/:id/register", verifyUserToken, registerForEvent);
router.delete("/:id/register", verifyUserToken, cancelEventRegistration);
router.get("/user/registered", verifyUserToken, getUserRegisteredEvents);

router.post("/", verifyToken, createEvent);
router.put("/:id", verifyToken, updateEvent);
router.delete("/:id", verifyToken, deleteEvent);

export default router;
