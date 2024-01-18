import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import helmet from 'helmet'
import express from 'express'
import passport from 'passport'
import auth from './auth/auth.middleware'
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import authRouter from './auth/auth.router'
import ErrorHandler from './core/error.handler'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

dotenv.config()

const app = express()
const errorHandler = new ErrorHandler()

// Allow cors requests from any origin and with credentials
app.use(
    cors({
        origin: (origin, callback) => callback(null, true),
        credentials: true,
    })
)
app.use(express.json())
app.use(helmet())
app.use(
    cookieSession({
        name: process.env.SESSION_COOKIE_NAME as string,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        keys: [process.env.SESSION_COOKIE_KEY_PRIMARY as string, process.env.SESSION_COOKIE_KEY_SECONDARY as string],
    })
)
app.use(cookieParser())

passport.serializeUser((user: any, done) => {
    const userData = {
        id: user.id,
        name: user.displayName,
        email: user.emails[0].value,
    }
    done(null, userData)
})

passport.deserializeUser((user: any, done) => {
    console.log('Deserializing user', user)
    done(null, user)
})

app.use(passport.initialize())
app.use(passport.session())

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET as string,
            callbackURL: process.env.PASSPORT_GOOGLE_CALLBACK_URL as string,
        },
        // Can be extracted
        (accessToken: string, refreshToken: string, profile: object, done: any) => {
            console.log('Got response from google in strategy', {
                accessToken,
                refreshToken,
                profile,
            })
            return done(null, profile)
        }
    )
)
app.use('/site', express.static(path.join(__dirname, '..', 'public')))

app.get('/site/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
app.get(
    '/site/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/site?failed=true', session: true }),
    function (req, res) {
        // Successful authentication, redirect home.
        console.log('Google auth callback is executed at the end', JSON.stringify(req.query))
        return res.redirect('/site')
    }
)

// Auth
app.use('/api/auth', authRouter)
app.use(auth)
app.get('/api/v1/protected', (req, res) => {
    return res.send('Hello from protected route')
})

// Handle 404
app.use('*', errorHandler.respondWithNotFound)

// Global error handler
app.use(errorHandler.handleError.bind(errorHandler))

export default app
