import crypto from "crypto"
import { Canvas } from "../../models/canvas.model.js"
import { Element } from "../../models/element.model.js"
import { Connector } from "../../models/connector.model.js"

export async function generateShareLinkService({ userId, id }) {

    const canvas = await Canvas.findOne(
        { _id: id },
        { userId: 1 }
    ).lean()

    if (!canvas)
        throw { status: 404, message: "Canvas not found" }

    if (canvas.userId.toString() !== userId)
        throw { status: 403, message: "You are not allowed to share this canvas" }

    const token = crypto.randomBytes(32).toString("hex")
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 4)

    await Canvas.updateOne(
        { _id: id },
        { $set: { shareToken: token, shareTokenExpiry: expiry } }
    )

    return { shareUrl: `${process.env.CLIENT_URL}/shared/${token}`, expiry }
}

export async function getSharedCanvasService({ token }) {

    const canvas = await Canvas.findOne({
        shareToken: token,
        shareTokenExpiry: { $gt: new Date() },  
    }).lean()

    if (!canvas)
        throw { status: 404, message: "Share link is invalid or has expired" }

    const [elements, connectors] = await Promise.all([
        Element.find({ canvasId: canvas._id }).lean(),
        Connector.find({ canvasId: canvas._id }).lean(),
    ])

    return {
        _id: canvas._id,
        title: canvas.title,
        manualElements: elements,      
        manualConnectors: connectors,   
        code: canvas.code,
        generatedGroupOffset: canvas.generatedGroupOffset,
    }
}

export async function revokeShareLinkService({ userId, id }) {

    const canvas = await Canvas.findOne(
        { _id: id },
        { userId: 1 }
    ).lean()

    if (!canvas)
        throw { status: 404, message: "Canvas not found" }

    if (canvas.userId.toString() !== userId)
        throw { status: 403, message: "You are not allowed to revoke this canvas" }

    await Canvas.updateOne(
        { _id: id },
        { $unset: { shareToken: "", shareTokenExpiry: "" } }
    )
}