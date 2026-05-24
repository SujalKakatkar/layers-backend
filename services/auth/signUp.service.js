import { User } from "../../models/user.model.js"
import bcrypt from 'bcrypt'
import { generateTokens } from "../../utils/generateTokens.js"


export async function signUpService({ fullName, email, password }) {
    const existingUser = await User.findOne({ email })
    if (existingUser)
        throw { status: 409, message: "Email already exists" }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ fullName, email, password: hashedPassword })

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