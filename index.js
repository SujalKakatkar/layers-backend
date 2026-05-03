import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { connectDb } from './config/connect.js'
import useAuthRoutes from './routes/auth.routes.js'
import useCanvasRouter from './routes/canvas.routes.js'
import morgan from 'morgan'

dotenv.config()

const app = express()

const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
]

// middlewares
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))

// routes
app.use("/auth", useAuthRoutes)
app.use("/canvas", useCanvasRouter)

// db + server
connectDb(process.env.MONGO_URL)
    .then(() => {
        console.log("Connected to DB")
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.error("DB connection failed", error)
        process.exit(1)
    })