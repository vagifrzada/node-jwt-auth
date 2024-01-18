import AuthError from './auth.error'
import { NextFunction, Request, Response } from 'express'
import AuthService, { LoginMethodReturnParams } from './auth.service'
import { SignUpDto } from './validation/signup-validation.schema'
import { SignInDto } from './validation/signin-validation.schema'

export default class AuthHandler {
    private authService: AuthService

    public constructor(authService: AuthService) {
        this.authService = authService
    }

    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const data: SignUpDto = req.validatedBody as SignUpDto
            await this.authService.register(data)
            return res.status(201).send({
                message: 'User registered successfully',
            })
        } catch (err) {
            if (err instanceof AuthError) {
                return res.status(400).send({
                    message: err.message,
                })
            }
            console.log('Error occurred while registering user', err)
            next(err)
        }
    }

    public async login(req: Request, res: Response) {
        try {
            // Check if logged in user trying to login again
            if (req.cookies?.refreshToken) {
                console.log('Old refresh token found in cookie')
                // await this.authService.revokeToken(req.cookies.refreshToken)
                res.clearCookie('refreshToken', { httpOnly: true })
                console.log('User logged out before logging in again')
            }

            const data: SignInDto = req.validatedBody as SignInDto
            const result: LoginMethodReturnParams = await this.authService.login(data)
            this.setTokenCookie(res, result.tokens.refreshToken)
            return res.status(200).send({
                message: 'User logged in successfully',
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
            })
        } catch (err) {
            if (err instanceof AuthError) {
                return res.status(400).send({
                    message: err.message,
                })
            }
            console.log('Error occurred while logging in user', err)
            return res.status(500).send('Internal Server Error')
        }
    }

    public async refreshToken(req: Request, res: Response) {
        try {
            const refreshToken: string = req.cookies?.refreshToken
            if (!refreshToken) {
                return res.sendStatus(401)
            }
            console.log('Refresh token received from cookie', refreshToken)
            const { accessToken, newRefreshToken } = await this.authService.refreshToken(refreshToken)
            this.setTokenCookie(res, newRefreshToken)

            return res.status(200).send({
                message: 'Access token refreshed successfully',
                accessToken,
            })
        } catch (err) {
            if (err instanceof AuthError) {
                res.clearCookie('refreshToken', { httpOnly: true })
                return res.status(401).send({
                    message: err.message,
                })
            }
            console.log('Error occurred while refreshing access token', err)
            return res.status(500).send('Internal Server Error')
        }
    }

    public async revokeToken(req: Request, res: Response) {
        try {
            // Client should delete access token too
            const refreshToken: string = req.cookies?.refreshToken
            if (!refreshToken) {
                return res.sendStatus(401)
            }
            await this.authService.revokeToken(refreshToken)
            res.clearCookie('refreshToken', { httpOnly: true })
            return res.status(200).send({
                message: 'User logged out successfully',
            })
        } catch (err) {
            if (err instanceof AuthError) {
                res.clearCookie('refreshToken', { httpOnly: true })
                return res.status(401).send({
                    message: err.message,
                })
            }
            console.log('Error occurred while logging out user', err)
            return res.status(500).send('Internal Server Error')
        }
    }

    private setTokenCookie(res: Response, token: string) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
    }
}
