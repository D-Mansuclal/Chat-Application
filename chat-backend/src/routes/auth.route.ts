import express from "express";
import { Router } from "express";
import { register, login, refreshToken, resendActivationEmail, activateAccount, 
    forgotPassword, resetPassword, logout } from "../controller/auth.controller";

const router: Router = express.Router();

// Routes for /api/auth
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/resend-activation-email", resendActivationEmail)
router.post("/activate-account", activateAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout)

export default router;
