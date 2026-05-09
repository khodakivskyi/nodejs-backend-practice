import request from "supertest";
import bcrypt from "bcryptjs";
import {app} from "../app";
import {connectDB, disconnectDB, clearDB} from "./setup";
import {UserModel} from "../models/user.model";

describe("Auth API", () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterEach(async () => {
        await clearDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    test("POST /auth/register should register user and not return password hash", async () => {
        const res = await request(app).post("/auth/register").send({
            email: "test@example.com",
            password: "secret12",
        });

        expect(res.status).toBe(201);
        expect(res.body.email).toBe("test@example.com");
        expect(res.body.passwordHash).toBeUndefined();
        expect(res.body).toHaveProperty("id");

        const saved = await UserModel.findOne({email: "test@example.com"}).select("+passwordHash");
        expect(saved).toBeTruthy();
        expect(saved!.passwordHash).not.toBe("secret12");
        expect(await bcrypt.compare("secret12", saved!.passwordHash)).toBe(true);
    });

    test("POST /auth/register should return 409 for duplicate email", async () => {
        await request(app).post("/auth/register").send({
            email: "dup@example.com",
            password: "secret12",
        });

        const res = await request(app).post("/auth/register").send({
            email: "dup@example.com",
            password: "secret12",
        });

        expect(res.status).toBe(409);
        expect(res.body.message).toBeTruthy();
    });

    test("POST /auth/register should return 400 for invalid data", async () => {
        const res = await request(app).post("/auth/register").send({
            email: "not-an-email",
            password: "123",
        });

        expect(res.status).toBe(400);
    });
});

