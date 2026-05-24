import { User } from "../../models/user.model.js"
import bcrypt from 'bcrypt'
import { generateTokens } from '../../utils/generateTokens.js'

export async function signInService({ email, password }) {
    const user = await User.findOne({ email }).select("+password +refreshToken")

    const isPasswordCorrect = user && await bcrypt.compare(password, user.password)
    if (!user || !isPasswordCorrect)
        throw { status: 401, message: "Invalid email or password" }

    const { accessToken, refreshToken } = generateTokens(user._id)

    await User.updateOne(
        { _id: user._id },
        { $set: { refreshToken } }
    )

    return {
        userData: { _id: user._id, fullName: user.fullName, email: user.email },
        accessToken,
        refreshToken
    }
}
