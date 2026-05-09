import request from "supertest";
import { app } from "../app";
import { connectDB, disconnectDB, clearDB } from "./setup";

describe("Players API", () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterEach(async () => {
        await clearDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    const registerAndLogin = async (email: string) => {
        await request(app).post("/auth/register").send({
            email,
            password: "secret12",
        });

        const login = await request(app).post("/auth/login").send({
            email,
            password: "secret12",
        });

        return login.headers["set-cookie"] as string[] | undefined;
    };

    test("GET /players should return empty array", async () => {
        const res = await request(app).get("/players");

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(0);
    });

    test("POST /players should create player", async () => {
        const cookies = await registerAndLogin("p1@example.com");
        const res = await request(app).post("/players").set("Cookie", cookies!).send({
            name: "Ronaldo",
            team: "Al Nassr",
            position: "Forwarder"
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe("Ronaldo");
    });

    test("POST /players should return 400 for invalid data", async () => {
        const cookies = await registerAndLogin("p2@example.com");
        const res = await request(app).post("/players").set("Cookie", cookies!).send({
            name: "",
            team: "",
            position: "INVALID"
        });

        expect(res.status).toBe(400);
    });

    test("GET /players/:id should return player", async () => {
        const cookies = await registerAndLogin("p3@example.com");
        const create = await request(app).post("/players").set("Cookie", cookies!).send({
            name: "Mbappe",
            team: "PSG",
            position: "Forwarder"
        });

        const res = await request(app).get(`/players/${create.body.id}`);

        expect(res.status).toBe(200);
        expect(res.body.name).toBe("Mbappe");
    });

    test("GET /players/:id should return 404 if not found", async () => {
        const res = await request(app).get("/players/507f1f77bcf86cd799439011");

        expect(res.status).toBe(404);
    });

    test("PATCH /players/:id should update player", async () => {
        const cookies = await registerAndLogin("p4@example.com");
        const create = await request(app).post("/players").set("Cookie", cookies!).send({
            name: "Neymar",
            team: "Al Hilal",
            position: "Forwarder"
        });

        const res = await request(app)
            .patch(`/players/${create.body.id}`)
            .set("Cookie", cookies!)
            .send({ team: "Barcelona" });

        expect(res.status).toBe(200);
        expect(res.body.team).toBe("Barcelona");
    });

    test("PATCH should return 400 for invalid data", async () => {
        const cookies = await registerAndLogin("p5@example.com");
        const create = await request(app).post("/players").set("Cookie", cookies!).send({
            name: "Kane",
            team: "Bayern",
            position: "Forwarder"
        });

        const res = await request(app)
            .patch(`/players/${create.body.id}`)
            .set("Cookie", cookies!)
            .send({ position: "INVALID" });

        expect(res.status).toBe(400);
    });

    test("PATCH should return 404 if not found", async () => {
        const cookies = await registerAndLogin("p6@example.com");
        const res = await request(app)
            .patch("/players/507f1f77bcf86cd799439011")
            .set("Cookie", cookies!)
            .send({ team: "Real" });

        expect(res.status).toBe(404);
    });

    test("DELETE /players/:id should delete player", async () => {
        const cookies = await registerAndLogin("p7@example.com");
        const create = await request(app).post("/players").set("Cookie", cookies!).send({
            name: "Lewandowski",
            team: "Barcelona",
            position: "Forwarder"
        });

        const res = await request(app).delete(`/players/${create.body.id}`).set("Cookie", cookies!);

        expect(res.status).toBe(204);
    });

    test("DELETE should return 404 if not found", async () => {
        const cookies = await registerAndLogin("p8@example.com");
        const res = await request(app).delete("/players/507f1f77bcf86cd799439011").set("Cookie", cookies!);

        expect(res.status).toBe(404);
    });

    test("GET /players should filter by team", async () => {
        const cookies = await registerAndLogin("p9@example.com");
        await request(app).post("/players").set("Cookie", cookies!).send({ name: "Modric", team: "Real Madrid", position: "Midfielder" });
        await request(app).post("/players").set("Cookie", cookies!).send({ name: "Messi", team: "Inter Miami", position: "Forwarder" });

        const res = await request(app).get("/players?team=Real");

        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe("Modric");
    });

    test("GET /players should filter by position", async () => {
        const cookies = await registerAndLogin("p10@example.com");
        await request(app).post("/players").set("Cookie", cookies!).send({ name: "Messi", team: "Inter Miami", position: "Forwarder" });
        await request(app).post("/players").set("Cookie", cookies!).send({ name: "Modric", team: "Real Madrid", position: "Midfielder" });

        const res = await request(app).get("/players?position=Forwarder");

        expect(res.body.data.length).toBe(1);
    });

    test("GET /players should filter by team + position", async () => {
        const cookies = await registerAndLogin("p11@example.com");
        await request(app).post("/players").set("Cookie", cookies!).send({ name: "Modric", team: "Real Madrid", position: "Midfielder" });
        await request(app).post("/players").set("Cookie", cookies!).send({ name: "Ronaldo", team: "Real Madrid", position: "Forwarder" });

        const res = await request(app).get("/players?team=Real&position=Forwarder");

        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe("Ronaldo");
    });

    test("GET /players/forwards should return only forwards", async () => {
        const cookies = await registerAndLogin("p12@example.com");
        await request(app).post("/players").set("Cookie", cookies!).send({ name: "Messi", team: "Inter Miami", position: "Forwarder" });
        await request(app).post("/players").set("Cookie", cookies!).send({ name: "Modric", team: "Real Madrid", position: "Midfielder" });

        const res = await request(app).get("/players/forwards");

        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe("Messi");
    });

    test("PATCH /players/:id should return 403 for non-owner", async () => {
        const ownerCookies = await registerAndLogin("owner@example.com");
        const otherCookies = await registerAndLogin("other@example.com");

        const create = await request(app).post("/players").set("Cookie", ownerCookies!).send({
            name: "OwnerPlayer",
            team: "Team",
            position: "Forwarder"
        });

        const res = await request(app)
            .patch(`/players/${create.body.id}`)
            .set("Cookie", otherCookies!)
            .send({ team: "Hacked" });

        expect(res.status).toBe(403);
    });

    test("DELETE /players/:id should return 403 for non-owner", async () => {
        const ownerCookies = await registerAndLogin("owner2@example.com");
        const otherCookies = await registerAndLogin("other2@example.com");

        const create = await request(app).post("/players").set("Cookie", ownerCookies!).send({
            name: "OwnerPlayer2",
            team: "Team",
            position: "Forwarder"
        });

        const res = await request(app)
            .delete(`/players/${create.body.id}`)
            .set("Cookie", otherCookies!);

        expect(res.status).toBe(403);
    });
});