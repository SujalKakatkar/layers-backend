import jwt from 'jsonwebtoken';

export function generateAccessToken(userId) {
    return jwt.sign(
        { userId },
        process.env.ACCESS_SECRET,
        { expiresIn: process.env.ACCESS_EXPIRY }
    );
}

export function generateRefreshToken(userId) {
    return jwt.sign(
        { userId },
        process.env.REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_EXPIRY }
    );
}

export function generateTokens(userId) {
    try {
        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);
        return { accessToken, refreshToken };
    } catch(err) {
        console.error('Token generation failed:', err.message);
        return null;
    }
}