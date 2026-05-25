import mongoose, { Schema } from "mongoose";

const CanvasSchema = new Schema(
    {
        title: { type: String, default: "Untitled Canvas", trim: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

        code: String,
        camera: {
            scale: { type: Number, default: 1 },
            offset: { x: { type: Number, default: 0 }, y: { type: Number, default: 0 } },
        },
        generatedGroupOffset: { x: Number, y: Number },

        elementCount: { type: Number, default: 0, min: 0 },
        connectorCount: { type: Number, default: 0, min: 0 },

        shareToken: { type: String, default: undefined },
        shareTokenExpiry: { type: Date, default: undefined },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: undefined },
    },
    { timestamps: true, versionKey: false }
)

CanvasSchema.index({ userId: 1, updatedAt: -1 })
CanvasSchema.index({ userId: 1, isDeleted: 1, updatedAt: -1 })
CanvasSchema.index({ shareToken: 1 }, { unique: true, sparse: true })
CanvasSchema.index({ shareTokenExpiry: 1 }, { expireAfterSeconds: 0 })

CanvasSchema.pre(/^find/, function () {
    if (this.getFilter().isDeleted === undefined) {
        this.where({ isDeleted: false })
    }
})

export const Canvas = mongoose.model("Canvas", CanvasSchema)