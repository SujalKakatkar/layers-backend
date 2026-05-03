import { Canvas } from "../models/canvas.model.js"
import { sendError } from "../utils/apiHandler.js"

const CANVAS_LIMIT = 10

export async function checkCanvasLimit(req, res, next) {
    try {
        const userId = req.user.userId

        const count = await Canvas.countDocuments({ userId })

        if (count >= CANVAS_LIMIT) {
            return sendError(
                res,
                403,
                `You have reached the maximum limit of ${CANVAS_LIMIT} canvases`
            )
        }

        next()

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}