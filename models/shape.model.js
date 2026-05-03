import { Schema } from "mongoose";

export const ShapeSchema = new Schema(
    {
        id: { type: String, required: true },

        type: {
            type: String,
            enum: ["rectangle", "circle", "stroke", "text"],
            required: true,
        },

        groupId: String,

        // rectangle + text
        x: Number,
        y: Number,
        width: Number,
        height: Number,

        // circle
        cx: Number,
        cy: Number,
        r: Number,

        // stroke
        points: [
            {
                x: Number,
                y: Number,
            },
        ],
        color: String,
        width: Number,

        // text
        text: String,
        fontSize: Number,
        fontWeight: String,
        textAlign: {
            type: String,
            enum: ["left", "center", "right"],
        },

        // shared
        rotation: { type: Number, default: 0 },
    },
    { _id: false }
);


export const ConnectorSchema = new Schema(
    {
        id: { type: String, required: true },

        fromShapeId: { type: String, required: true },
        toShapeId: { type: String, required: true },

        fromSide: {
            type: String,
            enum: ["top", "right", "bottom", "left"],
        },

        toSide: {
            type: String,
            enum: ["top", "right", "bottom", "left"],
        },
    },
    { _id: false }
);