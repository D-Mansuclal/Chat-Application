import { mailer } from "../../configs/mailer.config";
import logger from "../../configs/logger.config";

/**
 * Send an activation email after user registers
 * @param username The username of the registered user
 * @param email The email of the registered user
 * @param activationToken The activation token linked to the registered user
 */
export function sendActivationEmail(username: string, email: string, activationToken: string) {
    const MODULE_NAME = "Send Activation Email"
    const link = `${process.env.CLIENT_URL}/auth/activate-account?token=${activationToken}`;
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: process.env.NODE_ENV === "production" ? email : process.env.EMAIL_ADDRESS,
        subject: "Welcome to ChatterBox!",
        html: `
            <h1>Welcome to ChatterBox!</h1>
            <p>Hi ${username},</p>
            <p>Thank you for joining ChatterBox. We're thrilled to have you on board!</p>
            <p>Click <a href="${link}">here</a> to activate your account.</p>
            <p>or copy and paste the following link in your browser:</p>
            <p>${link}</p>
            <p>The link will expire in 24 hours.</p>
            <p>If you did not sign up for ChatterBox, please ignore this email.</p>
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