import { Router, Request, Response } from 'express';
import { create, deleteEntity, getAll, getById, update } from "../storage/player.storage";
import { createPlayerSchema, updatePlayerSchema } from "../schemas/player.schema";
import { validate } from "../middleware/validate";

export const playersRouter = Router();

playersRouter.get("/forwards", async(_: Request, res: Response) => {
    const players = await getAll({ position: 'forwarder'});
    res.status(200).json(players);
});

playersRouter.get("/", async (req, res) => {
    const { team, position, sort, page, limit } = req.query;

    const params: {
        team?: string;
        position?: string;
        sort?: string;
        page?: number;
        limit?: number;
    } = {};

    if (team) params.team = String(team);
    if (position) params.position = String(position);
    if (sort) params.sort = String(sort);
    if (page) params.page = Number(page);
    if (limit) params.limit = Number(limit);

    const result = await getAll(params);
    res.status(200).json(result);
});

playersRouter.get("/:id", async(req, res) => {
    const player = await getById(req.params.id);
    res.status(200).json(player);
});

playersRouter.post("/", validate(createPlayerSchema), async(req, res) => {
    const player = await create(req.body);
    res.status(201).json(player);
});

playersRouter.patch("/:id", validate(updatePlayerSchema), async(req, res) => {
    const updated = await update(req.params.id as string, req.body);
    res.status(200).json(updated);
});

playersRouter.delete("/:id", async(req, res) => {
    await deleteEntity(req.params.id);
    res.status(204).send();
});