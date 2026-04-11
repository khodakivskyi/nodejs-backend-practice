import mongoose, { Schema, Document } from "mongoose";

export interface PlayerDocument extends Document {
    name: string;
    description?: string;
    team: string;
    position: "Forwarder" | "Midfielder" | "Defender" | "Goalkeeper";
    createdAt: Date;
    updatedAt: Date;

    // virtual
    shortInfo: string;
}

const playerSchema = new Schema<PlayerDocument>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            minlength: [1, "Name is too short"],
            maxlength: [100, "Name is too long"],
        },

        description: {
            type: String,
            maxlength: [500, "Description is too long"],
            default: "",
        },

        team: {
            type: String,
            required: [true, "Team is required"],
            minlength: [1, "Team is too short"],
            maxlength: [100, "Team is too long"],
        },

        position: {
            type: String,
            required: true,
            enum: {
                values: ["Forwarder", "Midfielder", "Defender", "Goalkeeper"],
                message: "Invalid position",
            },
        },
    },
    {
        timestamps: true,
    }
);

playerSchema.path('name').validate({
    validator: (v: string) => !/\d/.test(v),
    message: "Name should not contain numbers",
});

playerSchema.virtual('shortInfo').get(function (){
    return `${this.name} (${this.position})`;
});

playerSchema.set('toJSON', {virtuals: true});
playerSchema.set('toObject', {virtuals: true});

export const PlayerModel = mongoose.model<PlayerDocument>(
    'Player',
    playerSchema,
);