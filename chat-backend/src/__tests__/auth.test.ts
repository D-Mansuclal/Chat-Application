import "dotenv/config";
import request from "supertest";
import app from "../server";
import dataSource from "../configs/db.config";
import { User } from "../models/User";

beforeAll(async () => {
    await dataSource.initialize();
});

afterEach(async () => {
    await dataSource.getRepository(User).clear();
});

afterAll(async () => {
    await dataSource.destroy();
});

describe("Register", () => {

    const user = { username: "test", email: "test@test.com", password: "Test.333", ipAddress: "127.0.0.1" };

    it("should return 200 OK on successful registration", async () => {
        const response = await request(app).post("/api/auth/register").send(user);
        expect(response.status).toBe(201);

        const checkUser = await dataSource.getRepository(User).findOne({ where: { username: user.username } });
        expect(checkUser).toBeDefined();
    });

    it("should return 400 Bad Request on missing username", async () => {
        const response = await request(app).post("/api/auth/register").send({ 
            email: user.email, password: user.password, ipAddress: user.ipAddress 
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Missing fields in request: username");
    });

    it("should return 400 Bad Request on missing email", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, password: user.password, ipAddress: user.ipAddress
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Missing fields in request: email");
    });

    it("should return 400 Bad Request on missing password", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email, ipAddress: user.ipAddress
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Missing fields in request: password");
    });

    it("should return 400 Bad Request on missing IP address", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email, password: user.password
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Missing fields in request: ipAddress");
    });

    it("should return a 409 Conflict on username already taken", async () => {
        await dataSource.getRepository(User).save(user);
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: "username@test.com", password: user.password, ipAddress: user.ipAddress
        });
        expect(response.status).toBe(409);
        expect(response.body.error).toBe("Username is already taken. Please choose another one");
    });

    it("should return a 409 Conflict on email already taken", async () => {
        await dataSource.getRepository(User).save(user);
        const response = await request(app).post("/api/auth/register").send({
            username: "username", email: user.email, password: user.password, ipAddress: user.ipAddress
        });
        expect(response.status).toBe(409);
        expect(response.body.error).toBe("Email is already taken. Please choose another one");
    });

    it("should return a 400 Bad Request on invalid username formats", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: "t&t333", email: user.email, password: user.password, ipAddress: user.ipAddress
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.username).toContain("Username must only contain letters, numbers, underscores and dashes");
    });

    it ("should return a 400 Bad request when username is too short (< 3 characters)", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: "te", email: user.email, password: user.password, ipAddress: user.ipAddress
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.username).toContain("Username must be at least 3 characters long");
    });

    it ("should return a 400 Bad request when username is too long (> 15 characters)", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: "testtesttesttest", email: user.email, password: user.password, ipAddress: user.ipAddress
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.username).toContain("Username must be at most 15 characters long");
    });

    it ("should return a 400 Bad request when email is invalid", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: "test@test", password: user.password, ipAddress: user.ipAddress
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.email).toContain("Email is not valid");
    });

    it ("should return a 400 Bad request when password is too short (< 8 characters)", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email, password: "Test.33", ipAddress: user.ipAddress
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.password).toContain("Password must be at least 8 characters long");
    });

    it ("should return a 400 Bad request when password does not contain an uppercase letter", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email, password: "test.333", ipAddress: user.ipAddress
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.password).toContain("Password must contain at least one uppercase letter");
    });

    it ("should return a 400 Bad request when password does not contain a lowercase letter", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email, password: "TEST.333", ipAddress: user.ipAddress
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.password).toContain("Password must contain at least one lowercase letter");
    });

    it ("should return a 400 Bad request when password does not contain a number", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email, password: "Test.test", ipAddress: user.ipAddress
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.password).toContain("Password must contain at least one number");
    });

    it ("should return a 400 Bad request when IP address is invalid", async () => {
        const response = await request(app).post("/api/auth/register").send({
            username: user.username, email: user.email, password: user.password, ipAddress: "127.0.0"
        });
        expect(response.status).toBe(400);
        expect(response.body.invalid.ipAddress).toContain("IP Address is not valid");
    });
});


