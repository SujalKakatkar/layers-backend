import { sendResponse, sendError } from "../utils/apiHandler.js"
import { createCanvasService } from "../services/canvas/createCanvas.service.js"
import { updateCanvasService } from '../services/canvas/updateCanvas.service.js'
import { getAllCanvasesService, getCanvasService } from "../services/canvas/getCanvases.service.js"
import { deleteCanvasService } from '../services/canvas/deleteCanvas.service.js'
import { generateShareLinkService, getSharedCanvasService, revokeShareLinkService } from "../services/canvas/shareCanvas.service.js"



export async function handleCreateCanvas(req, res) {
    try {
        const canvas = await createCanvasService({
            userId: req.user.userId,
            title: req.body.title
        })
        return sendResponse(res, 201, canvas, "Canvas created successfully")
    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleUpdateCanvas(req, res) {
    try {
        await updateCanvasService({
            userId: req.user.userId,
            id: req.params.id,
            payload: req.body
        })
        return sendResponse(res, 200, "Canvas updated successfully")
    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleDeleteCanvas(req, res) {
    try {
        await deleteCanvasService({
            userId: req.user.userId,
            id: req.params.id
        })
        return sendResponse(res, 200, null, "Canvas deleted successfully")
    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleGetCanvas(req, res) {
    try {
        
        
        const canvas = await getCanvasService({
            userId: req.user.userId,
            id: req.params.id
        })
        return sendResponse(res, 200, canvas, "Canvas fetched successfully")
    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleGetAllCanvases(req, res) {
    try {
        const canvases = await getAllCanvasesService({
            userId: req.user.userId
        })
        return sendResponse(res, 200, canvases, "Canvases fetched successfully")
    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleGenerateShareLink(req, res) {
    try {
        const { shareUrl, expiry } = await generateShareLinkService({
            userId: req.user.userId,
            id: req.params.id
        })
        return sendResponse(res, 200, { shareUrl, expiry }, "Share link generated successfully")
    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleGetSharedCanvas(req, res) {
    try {
        const canvas = await getSharedCanvasService({
            token: req.params.token
        })
        return sendResponse(res, 200, canvas, "Canvas fetched successfully")
    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleRevokeShareLink(req, res) {
    try {
        await revokeShareLinkService({
            userId: req.user.userId,
            id: req.params.id
        })
        return sendResponse(res, 200, null, "Share link revoked successfully")
    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}