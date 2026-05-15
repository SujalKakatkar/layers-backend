import crypto from 'crypto'
import { Canvas } from "../models/canvas.model.js"

export async function createCanvasService({ userId, title }) {
    const canvas = await Canvas.create({
        title: title || "Untitled Canvas",
        userId,
        manualElements: [],
        manualConnectors: [],
    })
    return canvas
}

export async function updateCanvasService({ userId, id, updates }) {
    const canvas = await Canvas.findById(id)

    if (!canvas)
        throw { status: 404, message: "Canvas not found" }

    if (canvas.userId.toString() !== userId)
        throw { status: 403, message: "You are not allowed to update this canvas" }

    const {
        title,
        manualElements,
        manualConnectors,
        code,
        generatedGroupOffset,
        camera
    } = updates

    

    if (title !== undefined) canvas.title = title
    if (manualElements !== undefined) canvas.manualElements = manualElements
    if (manualConnectors !== undefined) canvas.manualConnectors = manualConnectors
    if (code !== undefined) canvas.code = code
    if (generatedGroupOffset !== undefined) canvas.generatedGroupOffset = generatedGroupOffset
    if (camera !== undefined) canvas.camera = camera

    await canvas.save()
    return canvas
}

export async function deleteCanvasService({ userId, id }) {
    const canvas = await Canvas.findById(id)

    if (!canvas)
        throw { status: 404, message: "Canvas not found" }

    if (canvas.userId.toString() !== userId)
        throw { status: 403, message: "You are not allowed to delete this canvas" }

    await Canvas.findByIdAndDelete(id)
}

export async function getCanvasService({ userId, id }) {
    const canvas = await Canvas.findById(id)

    if (!canvas)
        throw { status: 404, message: "Canvas not found" }

    if (canvas.userId.toString() !== userId)
        throw { status: 403, message: "You are not allowed to access this canvas" }

    return canvas
}

export async function getAllCanvasesService({ userId }) {
    const canvases = await Canvas.find({ userId })
        .select("_id title createdAt updatedAt")
        .sort({ updatedAt: -1 })
    return canvases
}

export async function generateShareLinkService({ userId, id }) {
    const canvas = await Canvas.findById(id)

    if (!canvas)
        throw { status: 404, message: "Canvas not found" }

    if (canvas.userId.toString() !== userId)
        throw { status: 403, message: "You are not allowed to share this canvas" }

    const token = crypto.randomBytes(32).toString("hex")
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 4)

    canvas.shareToken = token
    canvas.shareTokenExpiry = expiry
    await canvas.save()

    const shareUrl = `${process.env.CLIENT_URL}/shared/${token}`
    return { shareUrl, expiry }
}

export async function getSharedCanvasService({ token }) {
    const canvas = await Canvas.findOne({
        shareToken: token,
        shareTokenExpiry: { $gt: Date.now() }
    })

    if (!canvas)
        throw { status: 404, message: "Share link is invalid or has expired" }

    return {
        _id: canvas._id,
        title: canvas.title,
        manualElements: canvas.manualElements,
        manualConnectors: canvas.manualConnectors,
        code: canvas.code,
        generatedGroupOffset: canvas.generatedGroupOffset,
    }
}

export async function revokeShareLinkService({ userId, id }) {
    const canvas = await Canvas.findById(id)

    if (!canvas)
        throw { status: 404, message: "Canvas not found" }

    if (canvas.userId.toString() !== userId)
        throw { status: 403, message: "You are not allowed to revoke this canvas" }

    canvas.shareToken = null
    canvas.shareTokenExpiry = null
    await canvas.save()
}