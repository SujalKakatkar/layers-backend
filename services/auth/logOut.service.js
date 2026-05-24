import { User } from "../../models/user.model.js"
import jwt from 'jsonwebtoken'

export async function signOutService({ token }) {
    let payload
    try {
        payload = jwt.verify(token, process.env.REFRESH_SECRET)
    } catch (err) {
        throw { status: 401, message: "invalid_token" }
    }

    const user = await User.findById(payload.userId).select("+refreshToken")
    if (!user)
        throw { status: 404, message: "user_not_found" }

    if (user.refreshToken !== token)
        throw { status: 401, message: "token_mismatch" }

    await User.updateOne(
        { _id: payload.userId },
        { $unset: { refreshToken: "" } }
    )
}
