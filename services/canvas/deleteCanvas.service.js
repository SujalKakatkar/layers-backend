import { Canvas } from "../../models/canvas.model.js";
import { Element } from "../../models/element.model.js";
import { Connector } from "../../models/connector.model.js";

export async function deleteCanvasService({ userId, id }) {

    // Lightweight — only fetch userId, nothing else
    const canvas = await Canvas.findOne(
        { _id: id },
        { userId: 1 }
    ).lean()

    if (!canvas)
        throw { status: 404, message: "Canvas not found" }

    if (canvas.userId.toString() !== userId)
        throw { status: 403, message: "You are not allowed to delete this canvas" }

    // Run all three in parallel
    await Promise.all([
        Canvas.updateOne(
            { _id: id },
            { $set: { isDeleted: true, deletedAt: new Date() } }  // soft delete
        ),
        Element.deleteMany({ canvasId: id }),      
        Connector.deleteMany({ canvasId: id }),    
    ])
}