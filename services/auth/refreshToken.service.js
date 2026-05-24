import { User } from "../../models/user.model.js"
import { generateTokens } from "../../utils/generateTokens.js"
import jwt from 'jsonwebtoken'


export async function refreshTokenService({ token }) {
    let payload
    try {
        payload = jwt.verify(token, process.env.REFRESH_SECRET)
    } catch (err) {
        throw { status: 401, message: "Invalid or expired refresh token" }
    }

    const user = await User.findById(payload.userId).select("+refreshToken")
    if (!user)
        throw { status: 401, message: "User not found" }

    if (user.refreshToken !== token)
        throw { status: 401, message: "Refresh token mismatch" }

    const { accessToken, refreshToken } = generateTokens(user._id)

    await User.updateOne(
        { _id: user._id },
        { $set: { refreshToken } }
    )

    return { accessToken, refreshToken }
}
