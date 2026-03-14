import {z} from "zod";

export const createPlayerSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    team: z.string().min(1).max(100),
    position: z.enum(["Forwarder", "Midfielder", "Defender", "Goalkeeper"]),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export type PlayerEntity = z.infer<typeof createPlayerSchema> & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}