import { Request, Response } from "express";
import { validateRequest } from "../utils/validateRequest";
import { User } from "../models/User";
import { hashSync } from "bcrypt";
import logger from "../configs/logger.config";
import dataSource from "../configs/db.config";

/**
 * Register a new user to the database
 * @param req The request object containing username, email, password
 * @param res The response object containing the status code and the message
 * @returns The response object containing the status code and the message
 */
export async function register(req: Request, res: Response) {
    try {
        const MODULE_NAME = "Register";
        const keys: string[] = ["username", "email", "password"];
        const checkBody = validateRequest(req, keys);
        if (checkBody) return res.status(400).json({ error: checkBody });

        const { username, email, password } = req.body;

        logger.info("User creation request received.", { method: MODULE_NAME, data: { username, email } });

        // Username Validation
        let usernameErrors: string[] = [];

        if (username.length < 3) usernameErrors.push("Username must be at least 3 characters long");
        if (username.length > 15) usernameErrors.push("Username must be at most 15 characters long");
        if (!/^[a-zA-Z0-9_-]*$/.test(username)) {
            usernameErrors.push("Username must only contain letters, numbers, underscores and dashes");
        }

        const checkUsername = await dataSource.getRepository(User).findOne({ where: { username: username } });
        if (checkUsername) { 
            return res.status(409).json({ 
                error: "Username is already taken. Please choose another one",
                username: username
            });
        }

        // Email Validation
        let emailErrors: string[] = [];

        if (!/^\S+@\S+\.\S+$/.test(email)) emailErrors.push("Email is not valid");
        const checkEmail = await dataSource.getRepository(User).findOne({ where: { email: email } });
        if (checkEmail) {
            return res.status(409).json({ 
                error: "Email is already taken. Please choose another one",
                email: email
            });
        }

        // Password Validation
        let passwordErrors: string[] = [];

        if (password.length < 8) passwordErrors.push("Password must be at least 8 characters long");
        if (!/[A-Z]/.test(password)) passwordErrors.push("Password must contain at least one uppercase letter");
        if (!/[a-z]/.test(password)) passwordErrors.push("Password must contain at least one lowercase letter");
        if (!/[0-9]/.test(password)) passwordErrors.push("Password must contain at least one number");

        if (usernameErrors.length > 0 || passwordErrors.length > 0 || emailErrors.length > 0) {
            logger.warn("User creation request failed.", { method: MODULE_NAME, data: { username, email } });
            return res.status(400).json({
                error: "Invalid parameter data provided.",
                invalid: { username: usernameErrors, password: passwordErrors, email: emailErrors} 
            })
        }

        const user = new User();
        user.username = username;
        user.email = email;
        user.password = hashSync(password, 10);

        await dataSource.getRepository(User).save(user);

        logger.info("User created.", { method: MODULE_NAME, data: { username, email } });

        return res.status(201).json({ message: "User created successfully" });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }

}
