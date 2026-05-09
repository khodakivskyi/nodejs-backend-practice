import {Router} from "express";
import {validate} from "../middleware/validate";
import {authSchema} from "../schemas/auth.schema";
import {authService} from "../services/auth.service";
import {jwtService} from "../services/jwt.service";
import {getCookieValue} from "../utils/cookies";

export const authRouter = Router();

authRouter.post("/register", validate(authSchema), async (req, res) => {
    const {email, password} = req.body as { email: string; password: string };
    const user = await authService.register({email, password});
    return res.status(201).json(user);
});

authRouter.post("/login", validate(authSchema), async (req, res) => {
    const {email, password} = req.body as { email: string; password: string };

    const {userId} = await authService.login({email, password});

    const accessToken = jwtService.signAccessToken(userId);
    const refreshToken = jwtService.signRefreshToken(userId);

    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    return res.status(200).json({message: "ok"});
});

authRouter.post("/refresh", async (req, res) => {
    const refreshToken = getCookieValue(req.headers.cookie, "refresh_token");
    if (!refreshToken) {
        throw new Error("UNAUTHORIZED");
    }

    const {userId} = jwtService.verifyRefreshToken(refreshToken);

    const newAccessToken = jwtService.signAccessToken(userId);
    const newRefreshToken = jwtService.signRefreshToken(userId);

    res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    res.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    return res.status(200).json({message: "ok"});
});

authRouter.post("/logout", async (_req, res) => {
    res.clearCookie("access_token", {httpOnly: true, secure: true, sameSite: "strict"});
    res.clearCookie("refresh_token", {httpOnly: true, secure: true, sameSite: "strict"});
    return res.status(204).send();
});

