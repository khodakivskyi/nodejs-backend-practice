import { z } from "zod";

export const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    BASE_URL: z.string().default("http://localhost:3000"),
    NODE_ENV: z.enum(["development", "test", "production"]).optional(),
})