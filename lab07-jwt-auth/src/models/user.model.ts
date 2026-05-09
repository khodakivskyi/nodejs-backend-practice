import mongoose, {Document, Schema} from "mongoose";
import bcrypt from "bcryptjs";

export interface UserDocument extends Document {
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            unique: true,
            index: true,
        },
        passwordHash: {
            type: String,
            required: [true, "Password hash is required"],
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("passwordHash")) return;

    const saltRounds = 10;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
});

userSchema.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => {
        const safeRet: any = ret;
        delete safeRet.passwordHash;
        delete safeRet.__v;
        return safeRet;
    },
});

userSchema.set("toObject", {virtuals: true});

export const UserModel = mongoose.model<UserDocument>("User", userSchema);

