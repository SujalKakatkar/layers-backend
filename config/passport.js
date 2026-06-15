// src/config/passport.js
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { User } from '../models/user.model.js'


passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value
            const googleId = profile.id

            // 1. Returning Google user
            let user = await User.findOne({ googleId })
            if (user) return done(null, user)

            // 2. Email already exists (email/password account) → link Google
            user = await User.findOne({ email })
            if (user) {
                user.googleId = googleId
                await user.save()
                return done(null, user)
            }

            // 3. Brand new user → signup
            const newUser = await User.create({
                googleId,
                fullName: profile.displayName,
                email,
                avatar: profile.photos[0].value,
                // no password field
            })

            return done(null, newUser)

        } catch (err) {
            return done(err, null)
        }
    }
))

export default passport