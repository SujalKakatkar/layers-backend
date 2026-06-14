import { sendResponse, sendError } from "../utils/apiHandler.js"

import { signInService } from "../services/auth/signIn.service.js"
import { signUpService } from "../services/auth/signUp.service.js"
import { forgotPasswordService } from "../services/auth/forgotPassword.service.js"
import { resetPasswordService } from "../services/auth/resetPassword.service.js"
import { signOutService } from "../services/auth/logOut.service.js"
import { refreshTokenService } from "../services/auth/refreshToken.service.js"
import { getMeService } from "../services/auth/getMe.service.js"
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js"
import passport from 'passport'

//todo : change the cookie options in the production 
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
};

export const handleGoogleLogin = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
})

// Step 2 — Google calls back here
export const handleGoogleCallback = [
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),

    async (req, res) => {
        try {
            const user = req.user          // MongoDB doc from Passport strategy

            const accessToken = generateAccessToken(user)
            const refreshToken = generateRefreshToken(user)

            // Save refreshToken to DB — same as your handleSignIn
            user.refreshToken = refreshToken
            await user.save()

            // Same cookie setup as your handleSignIn
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000     // 7 days
            })

            // Redirect to frontend with accessToken in URL
            // Frontend grabs it and stores in memory/state
            res.redirect(
                `${process.env.CLIENT_URL}/dashboard`
            )

        } catch (err) {
            res.redirect(`${process.env.CLIENT_URL}/auth/error`)
        }
    }
]

export async function handleSignIn(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password)
            return sendError(res, 400, "All fields are required")

        const { userData, accessToken, refreshToken } = await signInService({ email, password })

        res.cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)

        return sendResponse(res, 200, userData, "User logged in successfully")

    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleSignUp(req, res) {
    try {
        const { fullName, email, password } = req.body

        if (!fullName || !email || !password)
            return sendError(res, 400, "All fields are required")

        const { userData, accessToken, refreshToken } = await signUpService({ fullName, email, password })

        res.cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)

        return sendResponse(res, 201, userData, "User created successfully")

    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleForgotPassword(req, res) {
    try {
        const { email } = req.body

        if (!email)
            return sendError(res, 400, "Email is required")

        await forgotPasswordService({ email })

        return sendResponse(res, 200, null, "If this email exists, a reset link has been sent")

    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleResetPassword(req, res) {
    try {
        const token = req.query.token
        const { password } = req.body

        if (!token || !password)
            return sendError(res, 400, "Token and new password are required")

        if (password.length < 6)
            return sendError(res, 400, "Password must be at least 6 characters")

        await resetPasswordService({ token, password })

        return sendResponse(res, 200, null, "Password updated successfully")

    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleLogOut(req, res) {
    const token = req.cookies.refreshToken

    if (!token) return res.sendStatus(204)

    try {
        await signOutService({ token })
    } catch (err) {
        // clear cookies regardless of error reason
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")

        if (err.message === "invalid_token") return res.sendStatus(204)
        if (err.message === "user_not_found") return res.sendStatus(204)
        if (err.message === "token_mismatch")
            return sendError(res, 401, "Invalid refresh token")
    }

    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")

    return sendResponse(res, 200, null, "User logged out successfully")
}

export async function handleRefreshToken(req, res) {
    const token = req.cookies.refreshToken

    if (!token)
        return sendError(res, 401, "No refresh token provided")

    try {
        const { accessToken, refreshToken } = await refreshTokenService({ token })

        res.cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)

        return sendResponse(res, 200, null, "Access token refreshed successfully")

    } catch (error) {
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}

export async function handleGetMe(req, res) {
    try {
        const user = await getMeService({ userId: req.user.userId })
        return sendResponse(res, 200, user, "User fetched successfully")

    } catch (error) {
        if (error.status) return sendError(res, error.status, error.message)
        return sendError(res, 500, "Something went wrong")
    }
}