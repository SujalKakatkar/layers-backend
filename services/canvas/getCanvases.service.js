import { Canvas } from "../../models/canvas.model.js"
import { Element } from "../../models/element.model.js"
import { Connector } from "../../models/connector.model.js"

export async function getCanvasService({ userId, id }) {

    const canvas = await Canvas.findOne(
        { _id: id },
    ).select("-createdAt -updatedAt -elementCount -connectorCount").lean()
    
    if (!canvas)
        throw { status: 404, message: "Canvas not found" }

    if (canvas.userId.toString() !== userId)
        throw { status: 403, message: "You are not allowed to access this canvas" }

    // Fetch elements and connectors in parallel
    const [elements, connectors] = await Promise.all([
        Element.find({ canvasId: id }).select("-canvasId -createdAt -updatedAt").lean(),
        Connector.find({ canvasId: id }).select("-canvasId -createdAt -updatedAt").lean(),
    ])

    return {
        ...canvas,
        manualElements: elements,   
        manualConnectors: connectors,  
    }
}

export async function getAllCanvasesService({ userId }) {
    const canvases = await Canvas.find({ userId })
        .select("_id title elementCount connectorCount createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .lean()                      
    return canvases
}