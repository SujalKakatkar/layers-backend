import mongoose, { Schema } from "mongoose";
import { ConnectorSchema, ShapeSchema } from "./shape.model.js";

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
        camera: {
            zoom: {
                type: Number,
                default: 1
            },
            offsetX: {
                type: Number
            },
            offsetY: {
                type: Number
            }
        },
        shareToken: { type: String, default: null },
        shareTokenExpiry: { type: Date, default: null },
    },
    { timestamps: true }
);

export const Canvas = mongoose.model("Canvas", CanvasSchema)