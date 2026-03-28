import express from 'express';
import {playersRouter} from './routes/players.routes'
import {errorHandler} from "./middleware/errorHandler";

export const app = express();

app.use(express.json());
app.use("/players", playersRouter);

app.use(errorHandler);