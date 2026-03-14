import {NextFunction, Request, Response} from 'express';
import {ZodError} from "zod";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction ) => {
    if(err instanceof ZodError){
        return res.status(400).json({
            message: "Validation error",
            error: err.issues,
        })
    }

    if (err instanceof Error && err.message === "NOT_FOUND") {
        return res.status(404).json({ message: "Resource not found" });
    }

    return res.status(500).json({
        message: "Internal server error",
    });
}