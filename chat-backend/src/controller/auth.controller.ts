import { Request, Response } from "express";
import { validateRequest } from "../utils/validateRequest";
import { User } from "../models/User";
import { hashSync, compareSync } from "bcrypt";
import { sign } from "jsonwebtoken";
import { RefreshToken } from "../models/tokens/RefreshToken";
import { ActivationToken } from "../models/tokens/ActivationToken";
import { PasswordResetToken } from "../models/tokens/PasswordResetToken";
import { sendActivationEmail } from "../templates/emails/activationEmail";
import { sendPasswordResetEmail } from "../templates/emails/passwordResetEmail";
import { sendUnusualAccountActivityEmail } from "../templates/emails/unusualAccountActivityEmail";
import logger from "../configs/logger.config";
import dataSource from "../configs/db.config";
import 'dotenv/config';

/**
 * Register a new user to the database
 * @param req The request object containing username, email, password
 * @param res The response object containing the status code and the message
 * @returns 201 Created when user is created successfully
 * @returns 400 Bad Request when Request Body is malformed or incorrect
 * @returns 409 Conflict when a user with the same username/email exists
 * @returns 500 Internal Server Error when a server error occurs
 */
export async function register(req: Request, res: Response) {
    const MODULE_NAME: string = "Register";
    try {
        const keys: string[] = ["username", "email", "password"];
        const checkBody = validateRequest(req, MODULE_NAME, keys);
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

        const usernameExists = await dataSource.getRepository(User).findOne({ where: { username: username } });
        if (usernameExists) {
            const reason = "Username is already taken. Please choose another one";
            logger.warn("User creation request failed.", 
                { method: MODULE_NAME, data: { username, email }, reason: reason  });
            return res.status(409).json({ 
                error: reason,
                username: username
            });
        }

        // Email Validation
        let emailErrors: string[] = [];
        if (email.length > 320) emailErrors.push("Email is not in a valid format");
        if (!/^\S+@\S+\.\S+$/.test(email)) emailErrors.push("Email is not in a valid format");
        const emailExists = await dataSource.getRepository(User).findOne({ where: { email: email } });
        if (emailExists) {
            const reason = "Email is already taken. Please choose another one";
            logger.warn("User creation request failed.", 
                { method: MODULE_NAME, data: { username, email }, reason: reason });

            return res.status(409).json({ 
                error: reason,
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
            logger.warn("User creation request failed.", {
                method: MODULE_NAME, 
                data: { username, email },
                reason: { username: usernameErrors, password: passwordErrors, email: emailErrors } });
            
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

        const activationToken = await new ActivationToken().createToken(user);
        console.log((activationToken.token));


        if (Boolean(process.env.TOGGLE_EMAILS)) sendActivationEmail(username, email, activationToken.token);

        return res.status(201).json({ message: "User created successfully" });
    }
    catch (err: any) {
        logger.error("Internal Server Error", { method: MODULE_NAME, reason: err.stack })
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Authenticates a user into the application
 * @param req The request object containing username and password
 * @param res The response object containing the status code and the message
 * @returns 200 OK when user is successfully authenticated
 * @returns 400 Bad Request when Request Body is malformed or incorrect
 * @returns 401 Unauthorized when username or password is incorrect
 * @returns 500 Internal Server Error when a server error occurs
 */
export async function login(req: Request, res: Response) {
    const MODULE_NAME: string = "Login";
    try {
        const keys: string[] = ["username", "password"];
        const checkBody = validateRequest(req, MODULE_NAME, keys);
        if (checkBody) return res.status(400).json({ error: checkBody });

        const { username, password } = req.body;

        logger.info("User login request received.", { method: MODULE_NAME, data: { username } });

        const user = await dataSource.getRepository(User).findOne({ where: { username: username } });
        if (!user) {
            const reason = "Invalid username or password";
            const reasonForLog = "Username does not exist";
            logger.warn("User login request failed.", { method: MODULE_NAME, data: { username }, reason: reasonForLog });
            return res.status(401).json({ error: reason });
        }
        if (!compareSync(password, user.password)) {
            const reason = "Invalid username or password";
            const reasonForLog = "Password is incorrect";
            logger.warn("User login request failed.", { method: MODULE_NAME, data: { username }, reason: reasonForLog });
            return res.status(401).json({ error: reason });
        }
        if (!user.activated) {
            const reason = "User is not activated";
            logger.warn("User login request failed.", { method: MODULE_NAME, data: { username }, reason: reason });
            return res.status(401).json({ error: reason });
        }

        var token = sign(
            { id: user.id, username: user.username}, 
            String(process.env.JWT_SECRET), 
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        const refreshToken = await new RefreshToken().createToken(user, String(req.ip), String(req.headers["user-agent"]));

        res.cookie("refreshToken", refreshToken.token, { httpOnly: true, secure: true, sameSite: "none" });
        res.cookie("clientDeviceIdentifier", 
            refreshToken.clientDeviceIdentifier, { httpOnly: true, secure: true, sameSite: "none" });
        res.cookie("accessToken", token, { httpOnly: true, secure: true, sameSite: "none" });

        logger.info("User logged in.", { method: MODULE_NAME, 
            data: { username, ipAddress: req.ip, userAgent: req.headers["user-agent"] } 
        });
        return res.status(200).json({ message: "User logged in successfully" })

    }
    catch (err: any) {
        logger.error("Internal Server Error", { method: MODULE_NAME, reason: err.stack })
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Refreshes a user's access token if expired
 * @param req The request object containing username in the body, 
 * refresh token in the cookie and client device identifier in the cookie
 * @param res The response object containing the status code and the message
 * @returns 200 OK when a token is successfully refreshed
 * @returns 400 Bad Request when Request Body or cookies are malformed or incorrect
 * @returns 401 Unauthorized when username, refresh token or client device identifier are mismatched
 * @returns 500 Internal Server Error when a server error occurs
 */
export async function refreshToken(req: Request, res: Response) {
    const MODULE_NAME: string = "RefreshToken";
    try {
        const requestBodyKeys: string[] = ["username"];
        const cookieKeys: string[] = ["refreshToken", "clientDeviceIdentifier"];
        
        const checkRequest = validateRequest(req, MODULE_NAME, requestBodyKeys, cookieKeys);
        if (checkRequest) return res.status(400).json({ error: checkRequest });
        
        const username: string = req.body.username;
        const [requestToken, clientDeviceIdentifier] = [req.cookies.refreshToken, req.cookies.clientDeviceIdentifier];

        logger.info("User refresh token request received.", { method: MODULE_NAME, data: { username, clientDeviceIdentifier } });
        
        const user = await dataSource.getRepository(User).findOne({ where: { username: username } });
        if (!user) {
            const reasonForLog = "User does not exist";
            logger.warn("User refresh token request failed.", { 
                method: MODULE_NAME,
                data: { username, clientDeviceIdentifier, ipAddress: req.ip, userAgent: req.headers["user-agent"] },
                reason: reasonForLog
            });
            return res.status(401).json({ 
                error: "Refresh token request failed",
                reason: reasonForLog
            });
        }

        const refreshToken = await dataSource.getRepository(RefreshToken).findOne({ 
            relations: ["user"], where: { token: requestToken } 
        });

        if (!refreshToken) {
            const reasonForLog = "Refresh token does not exist";
            logger.warn("User refresh token request failed.", { 
                method: MODULE_NAME,
                data: { username, clientDeviceIdentifier, ipAddress: req.ip, userAgent: req.headers["user-agent"] },
                reason: reasonForLog
            });
            return res.status(401).json({ 
                error: "Refresh token request failed",
                reason: reasonForLog 
            });
        }
        if (refreshToken.clientDeviceIdentifier !== clientDeviceIdentifier) {
            const reasonForLog = "Client device identifier does not match";
            logger.warn("User refresh token request failed.", { 
                method: MODULE_NAME,
                data: { username, clientDeviceIdentifier, ipAddress: req.ip, userAgent: req.headers["user-agent"] },
                reason: reasonForLog
            });
            await refreshToken.remove();
            res.clearCookie("refreshToken");
            res.clearCookie("clientDeviceIdentifier");
            res.clearCookie("accessToken");

            if (Boolean(process.env.TOGGLE_EMAILS)) {
                sendUnusualAccountActivityEmail(user.username, user.email, req.ip!, req.headers["user-agent"]!);
            }

            return res.status(401).json({ 
                error: "Refresh token request failed.",
                reason: reasonForLog
            });
        }

        if (refreshToken.user.id !== user.id) {
            const reasonForLog = "User does not match";
            logger.warn("User refresh token request failed.", { 
                method: MODULE_NAME,
                data: { username, clientDeviceIdentifier, ipAddress: req.ip, userAgent: req.headers["user-agent"] },
                reason: reasonForLog
            });
            return res.status(401).json({ 
                error: "Refresh token request failed",
                reason: reasonForLog
            });
        }
        if (refreshToken.isExpired()) {
            const reasonForLog = "Refresh token expired";
            logger.warn("User refresh token request failed.", { 
                method: MODULE_NAME,
                data: { username, clientDeviceIdentifier, ipAddress: req.ip, userAgent: req.headers["user-agent"] },
                reason: reasonForLog
            });

            await refreshToken.remove();
            res.clearCookie("refreshToken");
            res.clearCookie("clientDeviceIdentifier");
            res.clearCookie("accessToken");

            return res.status(401).json({ 
                error: "Refresh token request failed",
                reason: reasonForLog 
            });
        }

        logger.info("User refresh token request succeeded.", { method: MODULE_NAME, data: { username, clientDeviceIdentifier } });
        const newToken = sign({ 
            id: user.id, username: user.username }, 
            String(process.env.JWT_SECRET), 
            { expiresIn: process.env.JWT_EXPIRATION 
        });

        return res.status(200).json({ 
            message: "Token refreshed successfully",
            token: newToken
        });

    }
    catch (err: any) {
        logger.error("Internal Server Error", { method: MODULE_NAME, reason: err.stack })
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Resends the activation token to the user's email address
 * @param req The request object containing the user's email address
 * @param res The response object containing the status code and message
 * @returns 200 OK on successful resend
 * @returns 400 Bad Request on missing/invalid request body
 * @returns 500 Internal Server Error when a server error occurs
 */
export async function resendActivationEmail(req: Request, res: Response) {
    const MODULE_NAME = "Resend Activation Token";
    try {
        const requestBodyKeys: string[] = ["email"];
        const checkRequest = validateRequest(req, MODULE_NAME, requestBodyKeys);
        if (checkRequest) return res.status(400).json({ error: checkRequest });

        const { email } = req.body;

        const user = await dataSource.getRepository(User).findOne({ where: { email } });
        if (!user) {
            const reason = "User does not exist";
            logger.warn("User activation token resend failed.", { method: MODULE_NAME, data: { email }, reason });
            return res.status(400).json({ error: reason });
        }
        await dataSource.getRepository(ActivationToken).delete({ user: { id: user.id } });
        const activationToken = await new ActivationToken().createToken(user);
        console.log(activationToken.token);

        if (Boolean(process.env.TOGGLE_EMAILS)) sendActivationEmail(user.username, email, activationToken.token);

        logger.info("User activation token resend succeeded.", { method: MODULE_NAME, data: { email } });

        return res.status(200).json({ message: "Activation token resent successfully" });

    }
    catch (err: any) {
        logger.error("Internal Server Error", { method: MODULE_NAME, reason: err.stack })
        return res.status(500).json({ error: "Internal server error" });
    }
}
/**
* Activates the user's account using the activation token
* @param req The request object containing the user's username and token
* @param res The response object containing the status code and message
* @returns 200 OK on successful activation
* @returns 400 Bad Request on missing/invalid request body, expired or invalid activation token, or user already activated
* @returns 500 Internal Server Error when a server error occurs
*/
export async function activateAccount(req: Request, res: Response) {
    const MODULE_NAME = "Activate Account";
    try {
        const requestBodyKeys: string[] = ["username", "token"];
        const checkRequest = validateRequest(req, MODULE_NAME, requestBodyKeys);
        if (checkRequest) return res.status(400).json({ error: checkRequest });

        const { username, token } = req.body;
        const activationToken = await dataSource.getRepository(ActivationToken).findOne({ 
            relations: ["user"], where: { token } 
        });
        if (!activationToken) {
            const reason = "Invalid activation token";
            logger.warn("User activation failed.", { method: MODULE_NAME, data: { username, token }, reason });
            return res.status(400).json({ error: reason });
        }

        if (await activationToken.isExpired()) {
            const reason = "Activation token expired";
            logger.warn("User activation failed.", { method: MODULE_NAME, data: { username, token }, reason });
            return res.status(400).json({ error: reason });
        }

        const user = await dataSource.getRepository(User).findOne({ where: { username } });
        if (!user) {
            const reason = "User does not exist";
            logger.warn("User activation failed.", { method: MODULE_NAME, data: { username, token }, reason });
            return res.status(400).json({ error: reason });
        }

        if(user.activated) {
            const reason = "User already activated";
            logger.warn("User activation failed.", { method: MODULE_NAME, data: { username, token }, reason });
            await activationToken.remove();
            return res.status(400).json({ error: reason });
        }

        if (activationToken.user.id !== user.id) {
            const reason = "User and activation token are mismatched";
            logger.warn("User activation failed.", { method: MODULE_NAME, data: { username, token }, reason });
            await activationToken.remove();
            return res.status(400).json({ error: reason });
        }

        user.activated = true;
        await dataSource.getRepository(User).save(user);
        await activationToken.remove();

        logger.info("User activation succeeded.", { method: MODULE_NAME, data: { username } });

        return res.status(200).json({ message: "Account activated successfully" });

    }
    catch (err: any) {
        logger.error("Internal Server Error", { method: MODULE_NAME, reason: err.stack })
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Sends a password reset email to the user
 * @param req The request containing the user's email
 * @param res The response object containing the status code and message
 * @returns 200 OK on successfully sending the password reset email
 * @returns 400 Bad Request on missing/invalid request body, or user does not exist
 * @returns 500 Internal Server Error when a server error occurs
 */
export async function forgotPassword(req: Request, res: Response) {
    const MODULE_NAME = "Forgot Password";
    try {
        const requestBodyKeys: string[] = ["email"];
        const checkRequest = validateRequest(req, MODULE_NAME, requestBodyKeys);
        if (checkRequest) return res.status(400).json({ error: checkRequest });

        const { email } = req.body;
        const user = await dataSource.getRepository(User).findOne({ where: { email } });
        if (!user) {
            const reason = "User does not exist";
            logger.warn("User forgot password failed.", { method: MODULE_NAME, data: { email }, reason });
            return res.status(400).json({ error: reason });
        }
        await dataSource.getRepository(PasswordResetToken).delete({ user: { id: user.id } });
        const passwordResetToken = await new PasswordResetToken().createToken(user);
        console.log(passwordResetToken.token);

        if (Boolean(process.env.TOGGLE_EMAILS)) sendPasswordResetEmail(user.username, email, passwordResetToken.token);

        logger.info("Password reset email sent.", { method: MODULE_NAME, data: { email } });
        return res.status(200).json({ message: "Password reset email sent successfully" });
    }
    catch (err: any) {
        logger.error("Internal Server Error", { method: MODULE_NAME, reason: err.stack })
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Reset the user's password
 * @param req The request containing the password reset token and new password
 * @param res The response object containing the status code and message
 * @returns 200 OK on successful password reset
 * @returns 400 Bad Request on missing/invalid request body, or password reset token is invalid
 * @returns 500 Internal Server Error when a server error occurs
 */
export async function resetPassword(req: Request, res: Response) {
    const MODULE_NAME = "Reset Password"
    try {
        const requestBodyKeys: string[] = ["token", "password"];
        const checkRequest = validateRequest(req, MODULE_NAME, requestBodyKeys);
        if (checkRequest) return res.status(400).json({ error: checkRequest });

        const { token, password } = req.body;
        const passwordResetToken = await dataSource.getRepository(PasswordResetToken).findOne({ 
            relations:["user"], where: { token } 
        });
        if (!passwordResetToken) {
            const reason = "Invalid password reset token";
            logger.warn("Password reset failed.", { method: MODULE_NAME, data: { token }, reason });
            return res.status(400).json({ error: reason });
        }

        if (await passwordResetToken.isExpired()) {
            const reason = "Password reset token expired";
            logger.warn("Password reset failed.", { method: MODULE_NAME, data: { token }, reason });
            return res.status(400).json({ error: reason });
        }

        const user = await dataSource.getRepository(User).findOne({ where: { id: passwordResetToken.user.id } });
        if (!user) {
            const reason = "User does not exist";
            logger.warn("Password reset failed.", { method: MODULE_NAME, data: { token }, reason });
            return res.status(400).json({ error: reason });
        }

        user.password = hashSync(password, 10);
        await dataSource.getRepository(User).save(user);
        await passwordResetToken.remove();
        await dataSource.getRepository(RefreshToken).delete({ user: { id: user.id } });

        logger.info("Password reset succeeded.", { method: MODULE_NAME, data: { email: user.email } });
        return res.status(200).json({ message: "Password reset successfully" });

    }
    catch(err: any) {
        logger.error("Internal Server Error", { method: MODULE_NAME, reason: err.stack })
    }
}

/**
 * Log a user out of the application
 * @param req The request containing a cookie with the refresh token and client device identifier
 * @param res The response object containing the status code and message
 * @returns 200 OK on successful logout
 * @returns 400 Bad Request on missing/invalid request body
 * @returns 500 Internal Server Error when a server error occurs
 */
export async function logout(req: Request, res: Response) {
    const MODULE_NAME = "Logout";
    try {
        const cookieKeys = ["refreshToken", "clientDeviceIdentifier"];
        const checkRequest = validateRequest(req, MODULE_NAME, null, cookieKeys);
        if (checkRequest) return res.status(400).json({ error: checkRequest });

        const { refreshToken, clientDeviceIdentifier } = req.cookies;
        const dbRefreshToken = await dataSource.getRepository(RefreshToken).findOne({
            relations: ["user"], where: { token: refreshToken, clientDeviceIdentifier }
        });

        if (!dbRefreshToken) {
            const reason = "Invalid refresh token";
            logger.warn("Logout error.", { method: MODULE_NAME, data: { refreshToken, clientDeviceIdentifier }, reason });
        }
        else {
            await dataSource.getRepository(RefreshToken).delete({ token: refreshToken, clientDeviceIdentifier });
        }
        res.clearCookie("refreshToken");
        res.clearCookie("clientDeviceIdentifier");
        res.clearCookie("accessToken");

        logger.info("Logout succeeded.", { method: MODULE_NAME, data: { 
            username: dbRefreshToken?.user?.username,
            clientDeviceIdentifier: clientDeviceIdentifier
        } });

        return res.status(200).json({ message: "Logout succeeded" });

    }
    catch(err: any) {
        logger.error("Internal Server Error", { method: MODULE_NAME, reason: err.stack })
        return res.status(500).json({ error: "Internal server error" });
    }
}