import jwt from "jsonwebtoken";
import {env} from "../config/env";

type TokenType = "access" | "refresh";

type TokenPayload = {
    sub: string;
    type: TokenType;
};

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "30d";

export const jwtService = {
    signAccessToken(userId: string): string {
        const payload: TokenPayload = {sub: userId, type: "access"};
        return jwt.sign(payload, env.JWT_SECRET, {expiresIn: ACCESS_EXPIRES_IN});
    },

    signRefreshToken(userId: string): string {
        const payload: TokenPayload = {sub: userId, type: "refresh"};
        return jwt.sign(payload, env.JWT_SECRET, {expiresIn: REFRESH_EXPIRES_IN});
    },

    verifyRefreshToken(token: string): { userId: string } {
        const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
        if (!decoded?.sub || decoded.type !== "refresh") {
            throw new Error("UNAUTHORIZED");
        }
        return {userId: decoded.sub};
    },
};

