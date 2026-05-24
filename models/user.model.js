// src/models/user.model.js
import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            maxlength: [100, "Full name cannot exceed 100 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            select: false, 
        },

        refreshToken: {
            type: String,
            select: false,     // ← never leaked in responses
        },

        resetPasswordToken: { type: String, default: undefined },
        resetPasswordExpiry: { type: Date, default: undefined },

        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

UserSchema.index(
    { resetPasswordExpiry: 1 },
    { expireAfterSeconds: 0, sparse: true }
)

export const User = mongoose.model("User", UserSchema)