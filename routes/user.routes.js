import express from "express";
import {
  updateProfile,
  deleteAccount,
} from "../controllers/user.controller.js";
import { verifyUserToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Both routes require authentication
router.put("/update-profile", verifyUserToken, updateProfile);
router.delete("/delete-account", verifyUserToken, deleteAccount);

export default router;
