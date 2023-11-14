import express from "express";
import { Router } from "express";
import { register } from "../controller/auth.controller";

const router: Router = express.Router();

// Routes for /api/auth

router.post("/register", register);

export default router;
