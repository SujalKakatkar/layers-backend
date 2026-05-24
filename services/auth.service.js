import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js"
import { generateTokens } from "../utils/generateTokens.js"
import { sendResetEmail } from "../utils/sendResetEmail.js"



export async function forgotPasswordService({ email }) {
    const user = await User.findOne({ email })
    if (!user) return // don't reveal if email exists

    const token = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000
    await user.save()

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
    await sendResetEmail(user.email, resetUrl)
}

export async function resetPasswordService({ token, password }) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: Date.now() }
    })

    if (!user)
        throw { status: 400, message: "Invalid or expired token" }

    const isSamePassword = await bcrypt.compare(password, user.password)
    if (isSamePassword)
        throw { status: 400, message: "New password cannot be same as old password" }

    user.password = await bcrypt.hash(password, 12)
    user.resetPasswordToken = undefined
    user.resetPasswordExpiry = undefined
    await user.save()
}

export async function logOutService({ token }) {
    let payload;
    try {
        payload = jwt.verify(token, process.env.REFRESH_SECRET)
    } catch (err) {
        throw { status: 401, message: "invalid_token" }
    }

    const user = await User.findById(payload.userId)
    if (!user) throw { status: 404, message: "user_not_found" }

    if (user.refreshToken !== token)
        throw { status: 401, message: "token_mismatch" }

    await User.updateOne(
        { _id: payload.userId },
        { $unset: { refreshToken: "" } }
    )
}

export async function refreshTokenService({ token }) {
    let payload;
    try {
        payload = jwt.verify(token, process.env.REFRESH_SECRET)
    } catch (err) {
        throw { status: 401, message: "Invalid or expired refresh token" }
    }

    const user = await User.findById(payload.userId)
    if (!user)
        throw { status: 401, message: "User not found" }

    if (user.refreshToken !== token)
        throw { status: 401, message: "Refresh token mismatch" }

    const { accessToken, refreshToken } = generateTokens(user._id)
    user.refreshToken = refreshToken
    await user.save()

    return { accessToken, refreshToken }
}

export async function getMeService({ userId }) {
    const user = await User.findById(userId).select("-password -refreshToken")
    if (!user) throw { status: 404, message: "User not found" }
    return user
}