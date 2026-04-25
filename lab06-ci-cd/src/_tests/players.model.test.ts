import { PlayerModel } from "../models/player.model";
import mongoose from "mongoose";

describe("Player Model (unit)", () => {
    test("should validate correct player", async () => {
        const player = new PlayerModel({
            name: "Ronaldo",
            team: "Al Nassr",
            position: "Forwarder"
        });

        await expect(player.validate()).resolves.toBeUndefined();
    });

    test("should fail validation for invalid data", async () => {
        const player = new PlayerModel({
            name: "",
            team: "",
            position: "INVALID"
        });

        await expect(player.validate()).rejects.toThrow();
    });

    test("should require name", async () => {
        const player = new PlayerModel({
            team: "Team",
            position: "Forwarder"
        });

        await expect(player.validate()).rejects.toThrow();
    });

    test("should fail when name contains numbers", async () => {
        const player = new PlayerModel({
            name: "Messi10",
            team: "Inter Miami",
            position: "Forwarder",
        });

        try {
            await player.validate();
            throw new Error("Validation did not throw");
        } catch (e) {
            if (e instanceof mongoose.Error.ValidationError) {
                expect(e.errors.name).toBeDefined();
                expect(e.errors.name?.message).toBe("Name should not contain numbers");
            } else {
                throw e;
            }
        }
    });
});