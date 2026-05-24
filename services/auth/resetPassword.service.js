import { User } from "../../models/user.model.js"
import crypto from 'crypto'

export async function resetPasswordService({ token, password }) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: Date.now() }
    }).select("+password")   // ← need password to compare

    if (!user)
        throw { status: 400, message: "Invalid or expired token" }

    const isSamePassword = await bcrypt.compare(password, user.password)
    if (isSamePassword)
        throw { status: 400, message: "New password cannot be same as old password" }

    await User.updateOne(
        { _id: user._id },
        {
            $set: { password: await bcrypt.hash(password, 12) },
            $unset: { resetPasswordToken: "", resetPasswordExpiry: "" }
        }
    )
}