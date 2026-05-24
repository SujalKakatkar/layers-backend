import { Canvas } from "../../models/canvas.model.js"




export async function createCanvasService({ userId, title }) {
    const canvas = await Canvas.create({
        title: title || "Untitled Canvas",
        userId,
    })
    return canvas
}
