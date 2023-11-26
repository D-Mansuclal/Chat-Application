import axios from 'axios'

export const authService= {

    /**
     * Posts to the backend /api/auth/register endpoint to create a new account.
     * @param username The username for the new user
     * @param email The email address for the new user
     * @param password The password for the new user
     * @returns Promise with HTTP status 401 from the server when user is created successfully
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
            })
        }
        catch (err: any) {
            return Promise.reject(err)
        }
    }
}