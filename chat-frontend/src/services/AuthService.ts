import axios from 'axios'

/**
 * Authentication service. Handles authentication related requests to the backend
 */
export const authService= {

    /**
     * Posts to the backend /api/auth/register endpoint to create a new account.
     * @param username The username for the new user
     * @param email The email address for the new user
     * @param password The password for the new user
     * @returns Promise with HTTP status 201 from the server when user is created successfully
     * @throws Promise with error response from server (status codes 400, 409, 500)
     */
    register: async (username: string, email: string, password: string) => {
        try {
            return axios({
                method: "post",
                url: "/api/auth/register",
                data: {
                    username: username,
                    email: email,
                    password: password,
                }
            });
        }
        catch (err: any) {
            return Promise.reject(err);
        }
    },

 /**
     * Posts to the backend /api/auth/login endpoint to log the user in.
     * @param username The user's username
     * @param password The user's password
     * @returns Promise with HTTP status 200 from the server when user logs in with the correct credentials
     * @throws Promise with error response from server (status codes 400, 401, 404, 500)
     */
    login: async (username: string, password: string) => {
        try {
            return axios({
                method: "post",
                url: "/api/auth/login",
                data: {
                    username: username,
                    password: password,
                }
            });
        }
        catch (err: any) {
            return Promise.reject(err);
        }
    },

    /**
     * Posts to the backend /api/auth/resend-activation-email endpoint to resend the activation email
     * @param email The email of the user needed to be activated
     * @returns Promise with HTTP status 200 from the server when the activation email is sent
     * @throws Promise with error response from server (status codes 400, 403, 404, 500)
     */
    resendActivationEmail: async (email: string) => {
        try {
            return axios({
                method: "post",
                url: "/api/auth/resend-activation-email",
                data: {
                    email: email
                }
            });
        }
        catch (err: any) {
            return Promise.reject(err);
        }
    },

    /**
     * Posts to the backend /api/auth/activate-account endpoint to activate the account
     * @param token The activation token from the email
     * @param username The username of the user
     * @returns Promise with HTTP status 200 from the server when the account is activated
     * @throws Promise with error response from server (status codes 400, 500)
     */
    activateAccount: async (token: string, username: string) => {
        try {
            return axios({
                method: "post",
                url: "/api/auth/activate-account",
                data: {
                    token: token,
                    username: username
                }
            });
        }
        catch (err: any) {
            return Promise.reject(err);
        }
    },

    forgotPassword: async (email: string) => {
        try {
            return axios({
                method: "post",
                url: "/api/auth/forgot-password",
                data: {
                    email: email
                }
            });
        }
        catch (err: any) {
            return Promise.reject(err);
        }
    }
}