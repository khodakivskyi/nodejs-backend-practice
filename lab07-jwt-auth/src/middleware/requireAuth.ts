import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {env} from "../config/env";
import {getCookieValue} from "../utils/cookies";

type AccessPayload = {
    sub: string;
    type: "access";
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
    try {
        const token = getCookieValue(req.headers.cookie, "access_token");
        if (!token) {
            throw new Error("UNAUTHORIZED");
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as AccessPayload;
        if (!decoded?.sub || decoded.type !== "access") {
            throw new Error("UNAUTHORIZED");
        }

        req.userId = decoded.sub;
        return next();
    } catch {
        return next(new Error("UNAUTHORIZED"));
    }
};

