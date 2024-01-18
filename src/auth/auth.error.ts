export default class AuthError extends Error {
    constructor(message: string) {
        super(message)
    }

    public static userNotFound(email?: string | undefined): AuthError {
        const message: string = email ? `User with email ${email} is not found` : 'User is not found'
        return new AuthError(message)
    }

    public static userAlreadyExists(email: string): AuthError {
        return new AuthError(`User with email ${email} already exists`)
    }

    public static invalidCredentials(): AuthError {
        return new AuthError('Invalid credentials')
    }

    public static invalidRefreshToken(): AuthError {
        return new AuthError('Invalid refresh token provided')
    }
}
