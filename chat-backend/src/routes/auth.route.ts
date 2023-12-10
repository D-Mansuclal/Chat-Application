import express from "express";
import { Router } from "express";
import { register, login, refreshToken } from "../controller/auth.controller";

const router: Router = express.Router();

// Routes for /api/auth
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

export default router;
