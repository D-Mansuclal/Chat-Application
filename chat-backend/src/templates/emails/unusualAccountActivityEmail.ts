import { mailer } from "../../configs/mailer.config";
import logger from "../../configs/logger.config";

/**
 * Send an activation email after user registers
 * @param username The username of the registered user
 * @param email The email of the registered user
 * @param ip The IP address of the unusual sign in attempt
 * @param userAgent The user agent of the unusual sign in attempt
 */
export function sendUnusualAccountActivityEmail(username: string, email: string, ip: string, userAgent: string) {
    const MODULE_NAME = "Unusual Account Activity Email"
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: process.env.NODE_ENV === "production" ? email : process.env.EMAIL_ADDRESS,
        subject: "Unusual Sign in on ChatterBox",
        html: `
            <h1>Unusual Sign in on ChatterBox</h1>
            <p>Hi ${username},</p>
            <p>We have detected an unusual sign in attempt on your ChatterBox account.</p>
            <p>The details of the sign in attempt are as follows:</p>
            <p>IP Address: ${ip}</p>
            <p>User Agent: ${userAgent}</p>
            <p>If this was not you, please reset your password to secure your account.</p>
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