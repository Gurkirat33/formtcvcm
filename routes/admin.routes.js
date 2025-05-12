import express from "express";
import {
  loginAdmin,
  registerAdmin,
  logoutAdmin,
  getCurrentAdmin,
  getEventsWithRegisteredUsers,
  getEventRegisteredUsers,
  getAllEventsAdmin,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  banUser,
  getAllUsers,
  getUsersByEvent,
  getUserWithEvents,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", verifyToken, logoutAdmin);
router.get("/me", verifyToken, getCurrentAdmin);

router.get("/events", verifyToken, getAllEventsAdmin);
router.post("/events", verifyToken, createEvent);
router.put("/events/:id", verifyToken, updateEvent);
router.delete("/events/:id", deleteEvent);
router.get("/events/:id", verifyToken, getEventById);

router.get("/events-with-users", verifyToken, getEventsWithRegisteredUsers);
router.get("/events/:id/users", verifyToken, getEventRegisteredUsers);

router.get("/users", verifyToken, getAllUsers);
router.get("/events/:eventId/users", verifyToken, getUsersByEvent);
router.get("/users/:id", verifyToken, getUserWithEvents);
router.put("/users/:id/ban", verifyToken, banUser);

export default router;
