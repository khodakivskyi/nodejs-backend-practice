import {z} from "zod";
import {createPlayerSchema, PlayerEntity, updatePlayerSchema} from "../schemas/player.schema";

const playerEntitiesMap = new Map<string, PlayerEntity>();


export const getAll = (filters?: {team?:string, position?: string}): PlayerEntity[] => {
    let players = Array.from(playerEntitiesMap.values());

    if (filters && players.length !== 0) {
        if (filters.team) {
            players = players.filter(p => p.team.toLowerCase().includes(filters.team!.toLowerCase()));
        }
        if (filters.position) {
            players = players.filter(p => p.position.toLowerCase() === filters.position!.toLowerCase());
        }
    }

    return players;
}

export const getById = (id: string): PlayerEntity | undefined => {
    const player = playerEntitiesMap.get(id);
    if (!player) throw new Error("NOT_FOUND");
    return player;
}

export const create = (data: z.infer<typeof createPlayerSchema>): PlayerEntity | undefined => {
    const parsedData = createPlayerSchema.parse(data);

    const newPlayer: PlayerEntity = {
        ...parsedData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    playerEntitiesMap.set(newPlayer.id, newPlayer);
    return newPlayer;
}

export const update = (id: string, data: z.infer<typeof updatePlayerSchema>): PlayerEntity | undefined => {
    const existing = getById(id);
    if (!existing) throw new Error("NOT_FOUND");

    const updatedPlayer = {
        ...existing,
        name: data.name ?? existing.name,
        team: data.team ?? existing.team,
        position: data.position ?? existing.position,
        description: data.description ?? existing.description,
        updatedAt: new Date(),
    } as PlayerEntity;

    playerEntitiesMap.set(id, updatedPlayer);
    return updatedPlayer;
}

export const deleteEntity = (id: string): boolean | undefined => {
    const existing = getById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return playerEntitiesMap.delete(existing.id);
}

export const resetStorage = (): void => {
    playerEntitiesMap.clear();
}