import mongoose, { Schema } from "mongoose";

const ConnectorSchema = new Schema(
    {
        canvasId: {
            type: Schema.Types.ObjectId,
            ref: "Canvas",
            required: true,
        },
        _id: { type: String, required: true },
        fromShapeId: { type: String, required: true },
        toShapeId: { type: String, required: true },
        fromSide: { type: String, enum: ["top", "right", "bottom", "left"] },
        toSide: { type: String, enum: ["top", "right", "bottom", "left"] },
    },
    { timestamps: true, versionKey: false }
)

ConnectorSchema.index({ canvasId: 1 })
ConnectorSchema.index({ canvasId: 1, _id: 1 }, { unique: true })
ConnectorSchema.index({ canvasId: 1, fromShapeId: 1 })
ConnectorSchema.index({ canvasId: 1, toShapeId: 1 })

export const Connector = mongoose.model("Connector", ConnectorSchema)