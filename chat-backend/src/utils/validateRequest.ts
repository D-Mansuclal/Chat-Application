import { Request } from "express";
import logger from "../configs/logger.config";

/**
 * Validate Request response bodies and cookies to ensure that they contain the required keys
 * @param req The request object
 * @param method The name of the module calling this function
 * @param requestBodyKeys The keys to check for in the request body or null if no request body is expected
 * @param cookieKeys The keys to check for in the cookies or null if no cookies are expected
 * @returns null if the request is valid, otherwise a string describing the error
 */
export function validateRequest(req: Request, method: string, requestBodyKeys: string[] | null = null, 
    cookieKeys: string[] | null = null) {

    if (!req.body && requestBodyKeys) {
        logger.warn("Request validation failed.", { 
            method: method, data: { ip: req.ip, userAgent: req.headers["user-agent"]},
            reason: `No request body. Request body requirements: ${requestBodyKeys.join(", ")}` 
        });
        return "Request body is empty";
    }

    if (!req.cookies && cookieKeys) {
        logger.warn("Request validation failed.", { 
            method: method, data: { ip: req.ip, userAgent: req.headers["user-agent"]} ,
            reason: `No cookies. Cookie requirements: ${cookieKeys.join(", ")}`
        });
        return "Request cookies are empty";
    }

    let missingBodyKeys: string[] = [];
    let missingCookieKeys: string[] = [];
    let returnString: string = "";
    if (requestBodyKeys) {
        requestBodyKeys.forEach(key => {
            if (!req.body[key]) {
                missingBodyKeys.push(key);
            }
        });

        if (missingBodyKeys.length > 0) {
            returnString += `Missing fields in request: ${missingBodyKeys.join(", ")}`;
        }
    }

    if (cookieKeys) {
        cookieKeys.forEach(key => {
            if (!req.cookies[key]) {
                missingCookieKeys.push(key);
            }
        });

        if (missingCookieKeys.length > 0) {
             returnString += `${requestBodyKeys && ", "}Missing fields in cookies: ${missingCookieKeys.join(", ")}`;
        }
    }

    if (returnString) {
        logger.warn("Request validation failed.", { 
            method: method, data: { ip: req.ip, userAgent: req.headers["user-agent"]},
            reason: returnString
        });
    }

    return returnString ? returnString : null;
}