import { resetStorage as reset } from "../storage/player.storage";
import request from "supertest";
import { app } from "../app";

describe("Players api", () => {
    beforeEach(() => {
        reset();
    });

    test("GET /players should return empty array", async () => {
        const res = await request(app).get("/players");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test("GET /players should return created players", async () => {
        await request(app).post("/players").send({
            name: "Messi",
            team: "Inter Miami",
            position: "Forwarder"
        });

        const res = await request(app).get("/players");

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
    });

    test("POST /players should create player", async () => {
        const res = await request(app)
            .post("/players")
            .send({
                name: "Ronaldo",
                team: "Al Nassr",
                position: "Forwarder"
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe("Ronaldo");
        expect(res.body.team).toBe("Al Nassr");
    });

    test("POST /players should return 400 for invalid data", async () => {
        const res = await request(app)
            .post("/players")
            .send({
                name: "",
                team: "",
                position: "INVALID"
            });

        expect(res.status).toBe(400);
    });

    test("GET /players/:id should return player", async () => {
        const create = await request(app)
            .post("/players")
            .send({
                name: "Mbappe",
                team: "PSG",
                position: "Forwarder"
            });

        const id = create.body.id;

        const res = await request(app).get(`/players/${id}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(id);
        expect(res.body.name).toBe("Mbappe");
    });

    test("GET /players/:id should return 404 if player not found", async () => {
        const res = await request(app).get("/players/unknown-id");

        expect(res.status).toBe(404);
    });

    test("PATCH /players/:id should update player", async () => {
        const create = await request(app)
            .post("/players")
            .send({
                name: "Neymar",
                team: "Al Hilal",
                position: "Forwarder"
            });

        const id = create.body.id;

        const res = await request(app)
            .patch(`/players/${id}`)
            .send({
                team: "Barcelona"
            });

        expect(res.status).toBe(200);
        expect(res.body.team).toBe("Barcelona");
    });

    test("PATCH /players/:id should return 400 for invalid update data", async () => {
        const create = await request(app)
            .post("/players")
            .send({
                name: "Kane",
                team: "Bayern",
                position: "Forwarder"
            });

        const id = create.body.id;

        const res = await request(app)
            .patch(`/players/${id}`)
            .send({
                position: "INVALID"
            });

        expect(res.status).toBe(400);
    });

    test("PATCH /players/:id should return 404 if player not found", async () => {
        const res = await request(app)
            .patch("/players/unknown-id")
            .send({
                team: "Real Madrid"
            });

        expect(res.status).toBe(404);
    });

    test("DELETE /players/:id should delete player", async () => {
        const create = await request(app)
            .post("/players")
            .send({
                name: "Lewandowski",
                team: "Barcelona",
                position: "Forwarder"
            });

        const id = create.body.id;

        const res = await request(app).delete(`/players/${id}`);

        expect(res.status).toBe(204);
    });

    test("DELETE /players/:id should return 404 if player not found", async () => {
        const res = await request(app).delete("/players/unknown-id");

        expect(res.status).toBe(404);
    });

    test("Created player should appear in GET /players", async () => {
        await request(app)
            .post("/players")
            .send({
                name: "Modric",
                team: "Real Madrid",
                position: "Midfielder"
            });

        const res = await request(app).get("/players");

        expect(res.body.length).toBe(1);
    });

    test("GET /players should filter by team", async () => {
        await request(app).post("/players").send({ name: "Modric", team: "Real Madrid", position: "Midfielder" });
        await request(app).post("/players").send({ name: "Messi", team: "Inter Miami", position: "Forwarder" });

        const res = await request(app).get("/players?team=Real");
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe("Modric");
    });

    test("GET /players should filter by position", async () => {
        await request(app).post("/players").send({ name: "Modric", team: "Real Madrid", position: "Midfielder" });
        await request(app).post("/players").send({ name: "Messi", team: "Inter Miami", position: "Forwarder" });

        const res = await request(app).get("/players?position=Forwarder");
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe("Messi");
    });

    test("GET /players should filter by team and position", async () => {
        await request(app).post("/players").send({ name: "Modric", team: "Real Madrid", position: "Midfielder" });
        await request(app).post("/players").send({ name: "Ronaldo", team: "Real Madrid", position: "Forwarder" });

        const res = await request(app).get("/players?team=Real&position=Forwarder");
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe("Ronaldo");
    });

    test("GET /players/forwards should return only forwards", async () => {
        await request(app).post("/players").send({ name: "Messi", team: "Inter Miami", position: "Forwarder" });
        await request(app).post("/players").send({ name: "Modric", team: "Real Madrid", position: "Midfielder" });

        const res = await request(app).get("/players/forwards");
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe("Messi");
    });
});