import request from "supertest";
import {app} from "../app";
import {connectDB, disconnectDB, clearDB} from "./setup";

function hasCookie(setCookie: string[] | undefined, name: string): string {
    const cookies = setCookie || [];
    const found = cookies.find((c) => c.startsWith(`${name}=`));
    if (!found) {
        throw new Error(`Missing cookie ${name}`);
    }
    return found;
}

describe("Auth tokens", () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterEach(async () => {
        await clearDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    test("POST /auth/login should set access and refresh cookies", async () => {
        await request(app).post("/auth/register").send({
            email: "login@example.com",
            password: "secret12",
        });

        const res = await request(app).post("/auth/login").send({
            email: "login@example.com",
            password: "secret12",
        });

        expect(res.status).toBe(200);
        expect(res.body.access_token).toBeUndefined();
        expect(res.body.refresh_token).toBeUndefined();

        const setCookie = res.headers["set-cookie"] as string[] | undefined;
        const access = hasCookie(setCookie, "access_token");
        const refresh = hasCookie(setCookie, "refresh_token");

        expect(access).toContain("HttpOnly");
        expect(access).toContain("Secure");
        expect(access).toContain("SameSite=Strict");

        expect(refresh).toContain("HttpOnly");
        expect(refresh).toContain("Secure");
        expect(refresh).toContain("SameSite=Strict");
    });

    test("POST /auth/login should return 401 for wrong credentials", async () => {
        await request(app).post("/auth/register").send({
            email: "wrong@example.com",
            password: "secret12",
        });

        const res = await request(app).post("/auth/login").send({
            email: "wrong@example.com",
            password: "badpass12",
        });

        expect(res.status).toBe(401);
    });

    test("POST /auth/refresh should rotate tokens using refresh cookie", async () => {
        await request(app).post("/auth/register").send({
            email: "refresh@example.com",
            password: "secret12",
        });

        const login = await request(app).post("/auth/login").send({
            email: "refresh@example.com",
            password: "secret12",
        });

        const loginCookies = login.headers["set-cookie"] as string[] | undefined;
        expect(loginCookies).toBeTruthy();

        const res = await request(app)
            .post("/auth/refresh")
            .set("Cookie", loginCookies!);

        expect(res.status).toBe(200);
        expect(res.body.access_token).toBeUndefined();
        expect(res.body.refresh_token).toBeUndefined();

        const setCookie = res.headers["set-cookie"] as string[] | undefined;
        expect(setCookie).toBeTruthy();
        hasCookie(setCookie, "access_token");
        hasCookie(setCookie, "refresh_token");
    });

    test("POST /auth/logout should clear cookies", async () => {
        await request(app).post("/auth/register").send({
            email: "logout@example.com",
            password: "secret12",
        });

        const login = await request(app).post("/auth/login").send({
            email: "logout@example.com",
            password: "secret12",
        });

        const cookies = login.headers["set-cookie"] as string[] | undefined;
        expect(cookies).toBeTruthy();

        const res = await request(app)
            .post("/auth/logout")
            .set("Cookie", cookies!);

        expect(res.status).toBe(204);

        const setCookie = res.headers["set-cookie"] as string[] | undefined;
        expect(setCookie).toBeTruthy();

        const clearedAccess = hasCookie(setCookie, "access_token");
        const clearedRefresh = hasCookie(setCookie, "refresh_token");

        expect(clearedAccess).toContain("Expires=");
        expect(clearedRefresh).toContain("Expires=");
    });
});

