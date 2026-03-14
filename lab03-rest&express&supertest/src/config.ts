import dotenv from 'dotenv';
import {envSchema} from "./schemas/env.schema";

dotenv.config();

export const env = envSchema.parse(process.env);