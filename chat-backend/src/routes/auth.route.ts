import express from "express";
import { Router } from "express";
import { register, login } from "../controller/auth.controller";

const router: Router = express.Router();

// Routes for /api/auth

router.post("/register", register);
router.post("/login", login);

export default router;
