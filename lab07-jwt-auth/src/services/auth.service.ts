import {UserModel, UserDocument} from "../models/user.model";
import bcrypt from "bcryptjs";

export const authService = {
    async register(params: { email: string; password: string }): Promise<UserDocument> {
        try {
            const {email, password} = params;

            return await UserModel.create({
                email,
                passwordHash: password,
            });
        } catch (err: any) {
            if (err?.code === 11000) {
                throw new Error("EMAIL_EXISTS");
            }
            throw err;
        }
    },

    async login(params: { email: string; password: string }): Promise<{ userId: string }> {
        const {email, password} = params;

        const user = await UserModel.findOne({email}).select("+passwordHash");
        if (!user) {
            throw new Error("UNAUTHORIZED");
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            throw new Error("UNAUTHORIZED");
        }

        return {userId: user._id.toString()};
    },
};

