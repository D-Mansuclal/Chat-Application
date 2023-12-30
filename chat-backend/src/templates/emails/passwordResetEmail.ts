import { mailer } from "../../configs/mailer.config";
import logger from "../../configs/logger.config";

/**
 * Send a password reset email to the user that requested it
 * @param username The username of the user
 * @param email The email of the user
 * @param activationToken The password reset token linked to the user
 */
export function sendPasswordResetEmail(username: string, email: string, passwordResetToken: string) {
    const MODULE_NAME = "Send Password Reset Email"
    const link = `${process.env.CLIENT_URL}/auth/reset-password?token=${passwordResetToken}`;
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: process.env.NODE_ENV === "production" ? email : process.env.EMAIL_ADDRESS,
        subject: "Reset your Password",
        html: `
            <h1>Reset your Password</h1>
            <p>Hi ${username},</p>
            <p>We received a request to reset your password.</p>
            <p>Click <a href="${link}">here</a> to reset your password.</p>
            <p>or copy and paste the following link in your browser:</p>
            <p>${link}</p>
            <p>The link will expire in 3 hours.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Thank you!</p>
            <p>The ChatterBox Team</p>
        `
    };

    mailer.sendMail(mailOptions, (err, info) => {
        if (err) {
            logger.error("Error sending email.", { method: MODULE_NAME, data: { username, email }, reason: err.stack });
            return;
        }
        logger.info("Email sent.", { method: MODULE_NAME, data: { username, email, emailId: info.messageId } });
    });
}