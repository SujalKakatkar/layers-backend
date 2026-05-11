import crypto from 'crypto'
import { Canvas } from "../models/canvas.model.js"
import { sendResponse, sendError } from "../utils/apiHandler.js"

export async function handleCreateCanvas(req, res) {
    try {
        const userId = req.user.userId

        const canvas = await Canvas.create({
            title: req.body.title || "Untitled Canvas",
            userId,
            manualElements: [],
            manualConnectors: [],
        })

        return sendResponse(res, 201, canvas, "Canvas created successfully")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleUpdateCanvas(req, res) {
    try {
        const userId = req.user.userId
        const { id } = req.params

        const canvas = await Canvas.findById(id)

        if (!canvas)
            return sendError(res, 404, "Canvas not found")

        if (canvas.userId.toString() !== userId)
            return sendError(res, 403, "You are not allowed to update this canvas")

        const {
            title,
            manualElements,
            manualConnectors,
            code,
            generatedGroupOffset,
            layout,
            camera
        } = req.body

        
        

        if (title !== undefined) canvas.title = title
        if (manualElements !== undefined) canvas.manualElements = manualElements
        if (manualConnectors !== undefined) canvas.manualConnectors = manualConnectors
        if (code !== undefined) canvas.code = code
        if (generatedGroupOffset !== undefined) canvas.generatedGroupOffset = generatedGroupOffset
        if (layout !== undefined) canvas.layout = layout
        if(camera !== undefined) canvas.camera = camera


        await canvas.save()

        return sendResponse(res, 200, canvas, "Canvas updated successfully")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}

// canvas.controller.js
export async function handleDeleteCanvas(req, res) {
    try {
        const userId = req.user.userId
        const { id } = req.params

        const canvas = await Canvas.findById(id)

        if (!canvas)
            return sendError(res, 404, "Canvas not found")

        if (canvas.userId.toString() !== userId)
            return sendError(res, 403, "You are not allowed to delete this canvas")

        await Canvas.findByIdAndDelete(id)

        return sendResponse(res, 200, null, "Canvas deleted successfully")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleGetCanvas(req, res) {
    try {
        const userId = req.user.userId
        const { id } = req.params

        const canvas = await Canvas.findById(id)

        if (!canvas)
            return sendError(res, 404, "Canvas not found")

        // make sure user owns this canvas
        if (canvas.userId.toString() !== userId)
            return sendError(res, 403, "You are not allowed to access this canvas")

        return sendResponse(res, 200, canvas, "Canvas fetched successfully")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleGetAllCanvases(req, res) {
    try {
        const userId = req.user.userId

        const canvases = await Canvas.find({ userId })
            .select("_id title createdAt updatedAt") // only send metadata, not shapes
            .sort({ updatedAt: -1 }) // most recently updated first

        return sendResponse(res, 200, canvases, "Canvases fetched successfully")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}


// POST /canvas/:id/share — generate share link
export async function handleGenerateShareLink(req, res) {
    try {
        const userId = req.user.userId
        const { id } = req.params

        const canvas = await Canvas.findById(id)

        if (!canvas)
            return sendError(res, 404, "Canvas not found")

        if (canvas.userId.toString() !== userId)
            return sendError(res, 403, "You are not allowed to share this canvas")

        // generate a random token
        
        const token = crypto.randomBytes(32).toString("hex")

        // expires in 4 days
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 4)

        canvas.shareToken = token
        canvas.shareTokenExpiry = expiry
        await canvas.save()

        const shareUrl = `${process.env.CLIENT_URL}/shared/${token}`

        console.log(shareUrl);
        
        return sendResponse(res, 200, { shareUrl, expiry }, "Share link generated successfully")

    } catch (error) {
        console.log(error);
        
        return sendError(res, 500, "Something went wrong")
    }
}

// GET /canvas/shared/:token — access shared canvas
export async function handleGetSharedCanvas(req, res) {
    try {
        const { token } = req.params

        const canvas = await Canvas.findOne({
            shareToken: token,
            shareTokenExpiry: { $gt: Date.now() } // not expired
        })

        if (!canvas)
            return sendError(res, 404, "Share link is invalid or has expired")
        console.log(canvas);
        

        // return canvas without sensitive fields
        const canvasData = {
            _id: canvas._id,
            title: canvas.title,
            manualElements: canvas.manualElements,
            manualConnectors: canvas.manualConnectors,
            code: canvas.code,
            generatedGroupOffset: canvas.generatedGroupOffset,
            layout: canvas.layout,
        }

        return sendResponse(res, 200, canvasData, "Canvas fetched successfully")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}

// DELETE /canvas/:id/share — revoke share link
export async function handleRevokeShareLink(req, res) {
    try {
        const userId = req.user.userId
        const { id } = req.params

        const canvas = await Canvas.findById(id)

        if (!canvas)
            return sendError(res, 404, "Canvas not found")

        if (canvas.userId.toString() !== userId)
            return sendError(res, 403, "You are not allowed to revoke this canvas")

        canvas.shareToken = null
        canvas.shareTokenExpiry = null
        await canvas.save()

        return sendResponse(res, 200, null, "Share link revoked successfully")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}