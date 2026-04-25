import express, { Request, Response } from 'express';
import {playersRouter} from './routes/players.routes'
import {errorHandler} from "./middleware/errorHandler";
import mongoose from "mongoose";

export const app = express();

app.get('/health', (req: Request, res: Response) => {
    const state = mongoose.connection.readyState;

    if(state === 1) {
        return res.status(200).json({
            status: 'ok',
            mongo: 'connected',
        });
    }

    return res.status(503).json({
        status: 'error',
        mongo: 'disconnected',
    })
});

app.use(express.json());
app.use('/players', playersRouter);

app.use(errorHandler);