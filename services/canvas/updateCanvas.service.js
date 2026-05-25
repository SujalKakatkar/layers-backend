// src/services/canvas/updateCanvas.service.js
import mongoose from "mongoose";
import { Canvas } from "../../models/canvas.model.js";
import { Element } from "../../models/element.model.js";
import { Connector } from "../../models/connector.model.js";

export async function updateCanvasService({ userId, id, payload }) {
    if (!mongoose.Types.ObjectId.isValid(id))
        throw { status: 400, message: "Invalid canvas id" }

    const canvas = await Canvas.findOne(
        { _id: id },
        { userId: 1 }
    ).lean()

    if (!canvas)
        throw { status: 404, message: "Canvas not found" }

    if (canvas.userId.toString() !== userId)
        throw { status: 403, message: "You are not allowed to update this canvas" }

    const {
        manualElements,
        manualConnectors,
        title,
        code,
        camera,
        generatedGroupOffset,
        layout,
    } = payload
    
    const $set = {}
    if (title !== undefined) $set.title = title
    if (code !== undefined) $set.code = code
    if (camera !== undefined) $set.camera = camera
    if (generatedGroupOffset !== undefined) $set.generatedGroupOffset = generatedGroupOffset
    if (Array.isArray(manualElements)) $set.elementCount = manualElements.length
    if (Array.isArray(manualConnectors)) $set.connectorCount = manualConnectors.length

    const ops = []
   
    if (Object.keys($set).length > 0)
        ops.push(
            Canvas.updateOne({ _id: id }, { $set })
        )
    if (Array.isArray(manualElements)) {
        $set.elementCount = manualElements.length
        const docs = manualElements.map(el => ({ canvasId: id, ...el }))
        ops.push(
            Element.deleteMany({ canvasId: id })
                .then(() => Element.insertMany(docs, { ordered: false }))
        )
    }

    if (Array.isArray(manualConnectors)) {
        $set.connectorCount = manualConnectors.length
        const docs = manualConnectors.map(cn => ({ canvasId: id, ...cn }))
        ops.push(
            Connector.deleteMany({ canvasId: id })
                .then(() => Connector.insertMany(docs, { ordered: false }))
        )
    }

    await Promise.all(ops)
    return { success: true }
}