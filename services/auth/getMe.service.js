import { User } from "../../models/user.model.js"


export async function getMeService({ userId }) {
    const user = await User.findById(userId).lean()
    if (!user) throw { status: 404, message: "User not found" }
    return user
}