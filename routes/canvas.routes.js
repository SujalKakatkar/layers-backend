import express from "express"
import rateLimit from 'express-rate-limit'
import {
    handleCreateCanvas,
    handleUpdateCanvas,
    handleGetCanvas,
    handleGetAllCanvases,
    handleGetSharedCanvas,
    handleGenerateShareLink,
    handleRevokeShareLink
} from "../controllers/canvas.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"
import { checkCanvasLimit } from "../middlewares/checkLimit.middleware.js"

const router = express.Router()

//rate limit
const canvasWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later" }
})

const canvasReadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { message: "Too many requests, please try again later" }
})

// all canvas routes are protected
router.use(verifyToken) // ✅ applies to all routes below

router.post("/", canvasWriteLimiter,checkCanvasLimit, handleCreateCanvas)
router.put("/:id", canvasWriteLimiter, handleUpdateCanvas)
router.get("/:id", canvasReadLimiter, handleGetCanvas)
router.get("/", canvasReadLimiter, handleGetAllCanvases)

//share link relate routes
router.get("/shared/:token", canvasReadLimiter, handleGetSharedCanvas) 
router.get("/:id", canvasReadLimiter, handleGetCanvas)
router.post("/:id/share", canvasWriteLimiter, handleGenerateShareLink)
router.delete("/:id/share", canvasWriteLimiter, handleRevokeShareLink)

export default router