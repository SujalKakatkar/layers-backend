import mongoose, { Schema } from "mongoose";
import { ConnectorSchema, ShapeSchema } from "./shape.model.js";

//todo: split the manualElements and manualConnectors into different collections in MongoDB

const CanvasSchema = new Schema(
    {
        title: String,
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true
        },

        manualElements: [ShapeSchema],
        manualConnectors: [ConnectorSchema],

        code: String,

        generatedGroupOffset: {
            x: Number,
            y: Number,
        },

        layout: {
            type: Map,
            of: new Schema({
                x: Number,
                y: Number,
            }, { _id: false }),
        },
        // Example MongoDB Schema update
        camera: {
            scale: { type: Number, default: 1 },
            offset: {
                x: { type: Number, default: 0 },
                y: { type: Number, default: 0 }
            }
        },

        shareToken: { type: String, default: null },
        shareTokenExpiry: { type: Date, default: null },
    },
    { timestamps: true }
);

export const Canvas = mongoose.model("Canvas", CanvasSchema)