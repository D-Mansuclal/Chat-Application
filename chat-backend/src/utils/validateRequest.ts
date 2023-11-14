import { Request } from "express";

/**
 * Validate Request response bodies to ensure that they contain the required keys
 * @param req The request object
 * @param keys The keys to check for
 * @returns null if the request body is valid, otherwise a string describing the error
 */
export function validateRequest(req: Request, keys: string[]) {

    if (!req.body) {
        return "Request body is empty";
    }

    let missingKeys: string[] = [];
    keys.forEach(key => {
        if (!req.body[key]) {
            missingKeys.push(key);
        }
    });

    if (missingKeys.length > 0) {
        return `Missing fields in request: ${missingKeys.join(", ")}`;
    }

    return null;
}