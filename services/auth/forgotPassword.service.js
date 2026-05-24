import { User } from "../../models/user.model.js"
import { sendResetEmail } from "../../utils/sendResetEmail.js"
import crypto from 'crypto'


export async function forgotPasswordService({ email }) {
    const user = await User.findOne({ email }, { _id: 1 }).lean()
    if (!user) return  // don't reveal if email exists

    const token = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    await User.updateOne(
        { _id: user._id },
        {
            $set: {
                resetPasswordToken: hashedToken,
                resetPasswordExpiry: new Date(Date.now() + 15 * 60 * 1000)
            }
        }
    )

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
    await sendResetEmail(email, resetUrl)
}