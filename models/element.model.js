import mongoose, { Schema } from "mongoose";

const ElementSchema = new Schema(
    {
        canvasId: {
            type: Schema.Types.ObjectId,
            ref: "Canvas",
            required: true,
        },
        _id: { type: String, required: true },
        type: { type: String, enum: ["rectangle", "circle", "stroke", "text"], required: true },
        groupId: { type: String, default: undefined },

        x: { type: Number, default: undefined },
        y: { type: Number, default: undefined },
        width: { type: Number, default: undefined },
        height: { type: Number, default: undefined },

        cx: { type: Number, default: undefined },
        cy: { type: Number, default: undefined },
        r: { type: Number, default: undefined },

        points: { type: [{ x: Number, y: Number }], default: undefined },
        strokeWidth: { type: Number, default: undefined },

        text: { type: String, default: undefined },
        fontSize: { type: Number, default: undefined },
        fontWeight: { type: String, default: undefined },
        textAlign: { type: String, enum: ["left", "center", "right"], default: undefined },

        color: { type: String, default: undefined },
        rotation: { type: Number, default: 0 },
    },
    { timestamps: true, versionKey: false, _id: false }
)

ElementSchema.index({ canvasId: 1 })
ElementSchema.index({ canvasId: 1, _id: 1 }, { unique: true })
ElementSchema.index({ canvasId: 1, groupId: 1 })
ElementSchema.index({ canvasId: 1, type: 1 })

export const Element = mongoose.model("Element", ElementSchema)