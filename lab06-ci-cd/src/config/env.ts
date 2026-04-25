import dotenv from 'dotenv';
import {envSchema} from "../schemas/env.schema";

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

export const env = envSchema.parse(process.env);