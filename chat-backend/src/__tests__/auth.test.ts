import "dotenv/config";
import request from "supertest";
import app from "../server";
import dataSource from "../configs/db.config";
import { User } from "../models/User";
import { RefreshToken } from "../models/tokens/RefreshToken";
import { hashSync } from "bcrypt";
import { verify } from "jsonwebtoken";

beforeAll(async () => {
    await dataSource.initialize();
});

afterEach(async () => {
    await dataSource.query("SET FOREIGN_KEY_CHECKS = 0");
    await dataSource.getRepository(RefreshToken).clear();
    await dataSource.getRepository(User).clear();
    await dataSource.query("SET FOREIGN_KEY_CHECKS = 1");
});

afterAll(async () => {
    await dataSource.destroy();
});

describe("Register", () => {

    const user = { username: "test", email: "test@test.com", password: "Test.333" };

    it("should return 200 OK on successful registration", async () => {
        const response = await request(app).post("/api/auth/register").send(user);
        expect(response.status).toBe(201);

        const checkUser = await dataSource.getRepository(User).findOne({ where: { username: user.username } });
        expect(checkUser).toBeDefined();
    });

    it("should return 400 Bad Request on missing username", async () => {
        const response = await request(app).post("/api/auth/register").send({ 
            email: user.email, password: user.password 
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("username");
    });

    it("should return 400 Bad Request on missing email", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, password: user.password
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("email");
    });

    it("should return 400 Bad Request on missing password", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("password");
    });

    it("should return a 409 Conflict on username already taken", async () => {
        await dataSource.getRepository(User).save(user);
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: "username@test.com", password: user.password
        });
        expect(response.status).toBe(409);
        expect(response.body.error).toBe("Username is already taken. Please choose another one");
    });

    it("should return a 409 Conflict on email already taken", async () => {
        await dataSource.getRepository(User).save(user);
        const response = await request(app).post("/api/auth/register").send({
            username: "username", email: user.email, password: user.password
        });
        expect(response.status).toBe(409);
        expect(response.body.error).toBe("Email is already taken. Please choose another one");
    });

    it("should return a 400 Bad Request on invalid username formats", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: "t&t333", email: user.email, password: user.password
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.username).toContain("Username must only contain letters, numbers, underscores and dashes");
    });

    it ("should return a 400 Bad request when username is too short (< 3 characters)", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: "te", email: user.email, password: user.password
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.username).toContain("Username must be at least 3 characters long");
    });

    it ("should return a 400 Bad request when username is too long (> 15 characters)", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: "testtesttesttest", email: user.email, password: user.password
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.username).toContain("Username must be at most 15 characters long");
    });

    it ("should return a 400 Bad request when email is invalid", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: "test@test", password: user.password
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.email).toContain("Email is not in a valid format");
    });

    it ("should return a 400 Bad request when password is too short (< 8 characters)", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email, password: "Test.33"
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.password).toContain("Password must be at least 8 characters long");
    });

    it ("should return a 400 Bad request when password does not contain an uppercase letter", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email, password: "test.333"
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.password).toContain("Password must contain at least one uppercase letter");
    });

    it ("should return a 400 Bad request when password does not contain a lowercase letter", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email, password: "TEST.333"
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.password).toContain("Password must contain at least one lowercase letter");
    });

    it ("should return a 400 Bad request when password does not contain a number", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email, password: "Test.test"
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.password).toContain("Password must contain at least one number");
    });
});

describe("Login", () => {

    const user = new User();
    user.username = "username";
    user.email = "username@test.com";
    user.password = hashSync("Test.333", 10);

    beforeAll(async () => {
        await dataSource.getRepository(User).save(user);
    });

    it("should return a 200 OK on successful login", async () => {
        const response = await request(app).post("/api/auth/login").send({
            username: user.username, password: "Test.333"
        });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();

        const dbUser = await dataSource.getRepository(User).findOne({ where: { username: user.username } });

        const decoded = verify(response.body.token, String(process.env.JWT_SECRET));

        expect(decoded).toMatchObject({
            id: dbUser?.id,
            username: user.username,
        });

        const responseCookies = response.headers["set-cookie"];
        expect(responseCookies).toHaveLength(2);

        const refreshToken = responseCookies[0].split(";")[0].split("=")[1];
        const clientDeviceIdentifier = responseCookies[1].split(";")[0].split("=")[1];

        const dbRefreshToken = await dataSource.getRepository(RefreshToken).findOne({
             relations: ["user"], where: { token: refreshToken } 
        });

        expect(dbRefreshToken?.token).toBe(refreshToken);
        expect(dbRefreshToken?.clientDeviceIdentifier).toBe(clientDeviceIdentifier);
        expect(dbRefreshToken?.user.username).toBe(user.username);
        
    });

    it("should return a 400 Bad Request on missing username", async () => {
        const response = await request(app).post("/api/auth/login").send({
            password: "Test.333"
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("username");
    });

    it("should return a 400 Bad Request on missing password", async () => {
        const response = await request(app).post("/api/auth/login").send({
            username: user.username
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("password");
    });

    it("should return a 401 Unauthorized on failed login", async () => {
        const response = await request(app).post("/api/auth/login").send({
            username: user.username, password: "incorrect"
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Invalid username or password");
    });
});

