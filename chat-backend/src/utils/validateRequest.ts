import { Request } from "express";

/**
 * Validate Request response bodies and cookies to ensure that they contain the required keys
 * @param req The request object
 * @param requestBodyKeys The keys to check for in the request body or null if no request body is expected
 * @param cookieKeys The keys to check for in the cookies or null if no cookies are expected
 * @returns null if the request is valid, otherwise a string describing the error
 */
export function validateRequest(req: Request, requestBodyKeys: string[] | null = null, cookieKeys: string[] | null = null) {

    if (!req.body && requestBodyKeys) {
        return "Request body is empty";
    }

    if (!req.cookies && cookieKeys) {
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



    return returnString ? returnString : null;
}