import express from 'express'
import rateLimit from 'express-rate-limit'
import {
    handleForgotPassword,
    handleGetMe,
    handleLogOut,
    handleRefreshToken,
    handleResetPassword,
    handleSignUp,
    handleSignIn,
} from '../controllers/auth.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
const router = express.Router()

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many attempts, Please try again later" }
})


router.post("/signin", authLimiter, handleSignIn)
router.post("/signup", authLimiter, handleSignUp)
router.post("/forgot-password", authLimiter, handleForgotPassword)
router.post("/reset-password", authLimiter, handleResetPassword)

//no limit
router.post("/logout", handleLogOut)
router.post("/refresh-token", handleRefreshToken)
//get user
router.get("/me", verifyToken, handleGetMe)

export default router