import mongoose from 'mongoose'


export async function connectDb(url) {
    return await mongoose.connect(url)
}