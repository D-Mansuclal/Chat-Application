import express from "express";
import { Router } from "express";
import { register, login, refreshToken, 
    resendActivationEmail, activateAccount, forgotPassword, resetPassword } from "../controller/auth.controller";

const router: Router = express.Router();

// Routes for /api/auth
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/resend-activation-email", resendActivationEmail)
router.post("/activate-account", activateAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
