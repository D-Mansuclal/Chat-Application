import express from "express";
import { Router } from "express";
import { register, login, refreshToken, resendActivationEmail } from "../controller/auth.controller";

const router: Router = express.Router();

// Routes for /api/auth
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/resend-activation-email", resendActivationEmail)

export default router;
