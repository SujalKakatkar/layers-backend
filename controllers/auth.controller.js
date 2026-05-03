import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import { generateTokens } from "../utils/generateTokens.js"
import { sendResponse, sendError } from "../utils/apiHandler.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { sendResetEmail } from "../utils/sendResetEmail.js"


export async function handleSignIn(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password)
            return sendError(res, 400, "All fields are required")

        const user = await User.findOne({ email })
        const isPasswordCorrect = user && await bcrypt.compare(password, user.password)

        if (!user || !isPasswordCorrect)
            return sendError(res, 401, "Invalid email or password")

        const { accessToken, refreshToken } = generateTokens(user._id)
        user.refreshToken = refreshToken
        await user.save()

        const options = { httpOnly: true, secure: false, sameSite: "lax" }

        res.cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)

        const userData = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email

        }

        return sendResponse(res, 200, userData, "User logged in successfully")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleSignUp(req, res) {
    try {
        const { fullName, email, password } = req.body

        if (!fullName || !email || !password)
            return sendError(res, 400, "All fields are required")

        const existingUser = await User.findOne({ email })
        if (existingUser)
            return sendError(res, 409, "Email already exists")

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ fullName, email, password: hashedPassword })

        const { accessToken, refreshToken } = generateTokens(user._id)
        user.refreshToken = refreshToken
        await user.save()

        const options = { httpOnly: true, secure: false, sameSite: "lax" }

        res.cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)

        const userData = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email

        }
        return sendResponse(res, 201, userData, "User created successfully")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleForgotPassword(req, res) {
    try {
        const { email } = req.body

        if (!email)
            return sendError(res, 400, "Email is required")

        const user = await User.findOne({ email })
        if (!user)
            return sendResponse(res, 200, null, "If this email exists, a reset link has been sent")

        const token = crypto.randomBytes(32).toString("hex")
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

        user.resetPasswordToken = hashedToken
        user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000
        await user.save()

        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
        await sendResetEmail(user.email, resetUrl)

        return sendResponse(res, 200, null, "If this email exists, a reset link has been sent")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleResetPassword(req, res) {
    try {
        const token = req.query.token
        const { newPassword } = req.body

        if (!token || !newPassword)
            return sendError(res, 400, "Token and new password are required")

        if (newPassword.length < 6)
            return sendError(res, 400, "Password must be at least 6 characters")

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: Date.now() }
        })

        if (!user)
            return sendError(res, 400, "Invalid or expired token")

        const isSamePassword = await bcrypt.compare(newPassword, user.password)
        if (isSamePassword)
            return sendError(res, 400, "New password cannot be same as old password")

        user.password = await bcrypt.hash(newPassword, 12)
        user.resetPasswordToken = undefined
        user.resetPasswordExpiry = undefined
        await user.save()

        return sendResponse(res, 200, null, "Password updated successfully")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleLogOut(req, res) {
    const token = req.cookies.refreshToken

    if (!token) return res.sendStatus(204)

    let payload;
    try {
        payload = jwt.verify(token, process.env.REFRESH_SECRET)
    } catch (err) {
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        return res.sendStatus(204)
    }

    const user = await User.findById(payload.userId)
    if (!user) return res.sendStatus(204)

    if (user.refreshToken !== token) {
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        return sendError(res, 401, "Invalid refresh token")
    }

    await User.updateOne({ _id: payload.userId }, { $unset: { refreshToken: "" } })

    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")

    return sendResponse(res, 200, null, "User logged out successfully")
}

export async function handleGetMe(req, res) {
    try {

        const user = await User.findById(req.user.userId)
            .select("-password -refreshToken")

        if (!user) return sendError(res, 404, "User not found")

        return sendResponse(res, 200, user, "User fetched successfully")

    } catch (error) {
        return sendError(res, 500, "Something went wrong")
    }
}


export async function handleRefreshToken(req, res) {
    const token = req.cookies.refreshToken

    if (!token)
        return sendError(res, 401, "No refresh token provided")

    let payload;
    try {
        payload = jwt.verify(token, process.env.REFRESH_SECRET)
    } catch (err) {
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        return sendError(res, 401, "Invalid or expired refresh token")
    }

    const user = await User.findById(payload.userId)
    if (!user)
        return sendError(res, 401, "User not found")

    if (user.refreshToken !== token) {
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        return sendError(res, 401, "Refresh token mismatch")
    }

    const { accessToken, refreshToken } = generateTokens(user._id)

    user.refreshToken = refreshToken
    await user.save()

    const options = { httpOnly: true, secure: false, sameSite: "lax" }

    res.cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)

    return sendResponse(res, 200, null, "Access token refreshed successfully")
}