import request from "supertest";
import {app} from "../app";
import {connectDB, disconnectDB, clearDB} from "./setup";

describe("Protected routes", () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterEach(async () => {
        await clearDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    test("POST /players should return 401 without access_token cookie", async () => {
        const res = await request(app).post("/players").send({
            name: "NoAuth",
            team: "Team",
            position: "Forwarder",
        });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({message: "Unauthorized"});
    });
});

