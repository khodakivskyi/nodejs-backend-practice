import {z} from 'zod';
import {NextFunction, Request, Response} from 'express';

export const validate = (schema: z.ZodTypeAny) => {
    return (req: Request, _: Response, next: NextFunction) => {
        try{
            req.body = schema.parse(req.body);
            next();
        } catch (err){
            next(err);
        }
    }
}