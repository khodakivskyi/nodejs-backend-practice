import {PlayerDocument, PlayerModel} from "../models/player.model";
import {createPlayerSchema, updatePlayerSchema} from "../schemas/player.schema";
import {z} from "zod";
import { SortOrder } from "mongoose";

export const getAll = async (params: {
    team?: string;
    position?: string;
    sort?: string;
    page?: number;
    limit?: number;
}) => {
    type SortField = "name" | "team" | "position" | "createdAt";

    const allowedFields: SortField[] = ["name", "team", "position", "createdAt"];

    const { team, position, sort, page = 1, limit = 10 } = params;

    const query: any = {};

    if (team) {
        query.team = { $regex: team, $options: "i" };
    }

    if (position) {
        query.position = { $regex: `^${position}$`, $options: "i" };
    }

    // sort
    let sortOption: Record<string, SortOrder> = {};
    if (sort) {
        const [field, order] = sort.split(":");
        if (field && allowedFields.includes(field as SortField)) {
            sortOption[field as SortField] =
                order === "desc" ? -1 : 1;
        }
    }

    // pagination
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        PlayerModel.find(query).sort(sortOption).skip(skip).limit(limit),
        PlayerModel.countDocuments(query),
    ]);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getById = async (id: string): Promise<PlayerDocument> => {
    const player = await PlayerModel.findById(id);
    if (!player) {
        throw new Error("NOT_FOUND");
    }
    return player;
};

export const create = async (
    data: z.infer<typeof createPlayerSchema>,
    ownerId: string
): Promise<PlayerDocument> => {
    const parsedData = createPlayerSchema.parse(data);

    const cleanData: Partial<typeof parsedData> = {
        ...parsedData,
    };

    if (cleanData.description === undefined) {
        delete cleanData.description;
    }

    return await PlayerModel.create({
        ...(cleanData as any),
        ownerId,
    });
};

export const update = async (
    id: string,
    data: z.infer<typeof updatePlayerSchema>,
    userId: string
): Promise<PlayerDocument> => {
    const parsedData = updatePlayerSchema.parse(data);

    const existing = await PlayerModel.findById(id);
    if (!existing) {
        throw new Error("NOT_FOUND");
    }
    if (existing.ownerId.toString() !== userId) {
        throw new Error("FORBIDDEN");
    }

    const updatedPlayer = await PlayerModel.findByIdAndUpdate(
        id,
        {...parsedData, updatedAt: new Date()},
        {
            new: true,
            runValidators: true
        },
    );

    if (!updatedPlayer) {
        throw new Error("NOT_FOUND");
    }

    return updatedPlayer;
};

export const deleteEntity = async (id: string, userId: string): Promise<boolean> => {
    const existing = await PlayerModel.findById(id);
    if (!existing) {
        throw new Error("NOT_FOUND");
    }
    if (existing.ownerId.toString() !== userId) {
        throw new Error("FORBIDDEN");
    }

    const result = await PlayerModel.findByIdAndDelete(id);
    if (!result) {
        throw new Error("NOT_FOUND");
    }

    return true;
}
