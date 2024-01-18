import bcrypt from 'bcrypt'
import User from './user.entity'
import { Roles } from './roles.enum'
import AuthError from './auth.error'
import { UserDocument } from './auth.types'
import UserRepository from './repositories/user.repository'
import jwt, { TokenExpiredError } from 'jsonwebtoken'
import { SignUpDto } from './validation/signup-validation.schema'
import { SignInDto } from './validation/signin-validation.schema'

interface RefreshToken {
    token: string
    userId: string
    createdAt: Date
    deactivatedAt: Date | null
}

interface JwtPayload {
    id: string
    email: string
    role: Roles
    createdAt: Date
}

export type LoginMethodReturnParams = {
    user: User
    tokens: {
        accessToken: string
        refreshToken: string
    }
}

const users: Array<User> = []
const refreshTokens: Array<RefreshToken> = []

export default class AuthService {
    public constructor(private readonly userRepository: UserRepository) {}

    public async getAll(filters: object) {
        return []
    }

    public async login(data: SignInDto): Promise<LoginMethodReturnParams> {
        const user: User | null = await this.userRepository.find({ email: data.email })
        if (!user) {
            throw AuthError.userNotFound(data.email)
        }
        const isPasswordMatching: boolean = await bcrypt.compare(data.password, user.getPassword())
        if (!isPasswordMatching) {
            throw AuthError.invalidCredentials()
        }

        const jwtPayload: JwtPayload = {
            id: user.getId(),
            email: user.getEmail(),
            role: user.getRole(),
            createdAt: user.getCreatedAt(),
        }

        const accessToken: string = jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET as string, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
        })
        const refreshToken: string = jwt.sign(jwtPayload, process.env.ACCESS_REFRESH_SECRET as string, {
            expiresIn: process.env.ACCESS_REFRESH_EXPIRES_IN,
        })
        // Store refresh token in memory
        refreshTokens.push({
            token: refreshToken,
            userId: user.getId(),
            createdAt: new Date(),
            deactivatedAt: null,
        })

        return {
            user,
            tokens: {
                accessToken,
                refreshToken,
            },
        }
    }

    public async register(data: SignUpDto): Promise<User> {
        const foundUser: User | null = await this.userRepository.find({ email: data.email })
        if (foundUser) {
            throw AuthError.userAlreadyExists(data.email)
        }

        const userDoc: UserDocument = {
            email: data.email,
            password: bcrypt.hashSync(data.password, 10),
            role: Roles.User,
            createdAt: new Date(),
        }

        return await this.userRepository.create(userDoc)
    }

    public async refreshToken(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
        const findRefreshToken: RefreshToken | undefined = refreshTokens.find((item: RefreshToken) => item.token === refreshToken)

        if (!findRefreshToken || findRefreshToken.deactivatedAt !== null) {
            // Revoked refresh token. Old refresh token reused
            // Important: Can decode provided refresh token, extract user info from it
            // Find the user and maybe notify him about suspicious activity.
            // Revoke all refresh tokens for this user
            throw AuthError.invalidRefreshToken()
        }

        // Get refresh token owner (Need for comparing)
        const user: User | undefined = users.find((item: User) => item.getId() === findRefreshToken.userId)
        if (!user) {
            console.log('Cannot find user but refresh token exists')
            throw AuthError.invalidRefreshToken()
        }

        try {
            const jwtRefreshTokenPayload: JwtPayload = jwt.verify(findRefreshToken.token, process.env.ACCESS_REFRESH_SECRET as string) as JwtPayload
            console.log('Refresh token decoded', jwtRefreshTokenPayload)
            if (!this.compareUserData(user, jwtRefreshTokenPayload)) {
                console.log('User data in refresh token is not matching') // Altered JWT Token ?
                throw AuthError.invalidRefreshToken()
            }

            const jwtPayload: JwtPayload = {
                id: user.getId(),
                email: user.getEmail(),
                role: user.getRole(),
                createdAt: user.getCreatedAt(),
            }

            const accessToken: string = jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET as string, {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
            })

            // Refresh Token Rotation
            // Refresh Token Rotation needed, delete old refresh token
            const index: number = refreshTokens.findIndex((item: RefreshToken) => item.token === findRefreshToken.token)
            refreshTokens.splice(index, 1)

            const newRefreshToken: string = jwt.sign(jwtPayload, process.env.ACCESS_REFRESH_SECRET as string, {
                expiresIn: process.env.ACCESS_REFRESH_EXPIRES_IN,
            })
            // Store refresh token in memory
            refreshTokens.push({
                token: newRefreshToken,
                userId: user.getId(),
                createdAt: new Date(),
                deactivatedAt: null,
            })

            return {
                accessToken,
                newRefreshToken,
            }
        } catch (err) {
            if (err instanceof TokenExpiredError) {
                console.log('We identified that refresh token is expired', {
                    expiredAt: err.expiredAt,
                    refreshToken,
                })
                const index: number = refreshTokens.findIndex((item: RefreshToken) => item.token === findRefreshToken.token)
                refreshTokens.splice(index, 1)
            }
            throw AuthError.invalidRefreshToken()
        }
    }

    private compareUserData(user: User, jwtPayload: JwtPayload): boolean {
        return user.getId() === jwtPayload.id && user.getEmail() === jwtPayload.email && user.getRole() === jwtPayload.role
    }

    public async revokeToken(refreshToken: string): Promise<void> {
        console.log('Refresh tokens before logout', refreshTokens)
        // Check refresh token
        const findRefreshToken: RefreshToken | undefined = refreshTokens.find((item: RefreshToken) => item.token === refreshToken)
        if (!findRefreshToken) {
            console.log('Cannot find refresh token')
            throw AuthError.invalidRefreshToken()
        }
        // Find refresh token owner
        const user: User | undefined = users.find((item: User) => item.getId() === findRefreshToken.userId)
        if (!user) {
            console.log('Cannot find user but refresh token exists')
            throw AuthError.invalidRefreshToken()
        }
        const index: number = refreshTokens.findIndex((item: RefreshToken) => item.token === refreshToken)
        refreshTokens.splice(index, 1)

        console.log('Refresh tokens after logout', refreshTokens)
    }
}
