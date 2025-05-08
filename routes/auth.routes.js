import express from "express";
import {
  register,
  login,
  getProfile,
  logout,
  validateToken,
} from "../controllers/auth.controller.js";
import { verifyUserToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/validate-token", validateToken);

router.get("/profile", verifyUserToken, getProfile);

export default router;
