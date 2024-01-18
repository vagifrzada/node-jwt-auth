import { verify, TokenExpiredError } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const auth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')
        if (!token) {
            return res.status(401).send({
                message: 'Access Denied',
            })
        }
        console.log('Token is received', token)
        if (!token.startsWith('Bearer')) {
            return res.status(401).send({
                message: 'Invalid token provided',
            })
        }
        const accessToken: string = token.split(' ')[1]
        const verifiedUser = verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string)
        console.log('Verified user', verifiedUser)
        req.user = verifiedUser
        next()
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            return res.status(403).send({
                message: 'Invalid token provided. Token is expired',
            })
        }

        next(err)
    }
}

export default auth
