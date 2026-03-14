import { Router, Request, Response } from 'express';
import { create, deleteEntity, getAll, getById, update } from "../storage/player.storage";
import { createPlayerSchema, updatePlayerSchema } from "../schemas/player.schema";
import { validate } from "../middleware/validate";

export const playersRouter = Router();

playersRouter.get("/forwards", (_: Request, res: Response) => {
    const players = getAll().filter(p => p.position.toLowerCase() === "forwarder");
    res.status(200).json(players);
});

playersRouter.get("/", (req, res) => {
    const query: { team?: string; position?: string } = {};
    if (req.query.team) query.team = String(req.query.team);
    if (req.query.position) query.position = String(req.query.position);

    const players = getAll(query);
    res.status(200).json(players);
});

playersRouter.get("/:id", (req, res) => {
    const player = getById(req.params.id);
    res.status(200).json(player);
});

playersRouter.post("/", validate(createPlayerSchema), (req, res) => {
    const player = create(req.body);
    res.status(201).json(player);
});

playersRouter.patch("/:id", validate(updatePlayerSchema), (req, res) => {
    const updated = update(req.params.id as string, req.body);
    res.status(200).json(updated);
});

playersRouter.delete("/:id", (req, res) => {
    deleteEntity(req.params.id);
    res.status(204).send();
});