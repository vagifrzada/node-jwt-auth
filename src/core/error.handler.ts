import AppError from './app.error'
import { ErrorTypes } from '../common/enums'
import { NextFunction, Request, Response } from 'express'

export default class ErrorHandler {
    public async handleError(err: Error, req: Request, res: Response, next: NextFunction) {
        if (err instanceof AppError) {
            const payload: object = this.getResponsePayload(err)
            return res.status(err.statusCode).json({ message: err.message, ...payload })
        }
        // Log error here
        console.log('Unhandled error occurred', {
            message: err.message,
            requestUser: {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            },
            stack: err.stack,
        })
        return res.status(500).json({ message: 'Oops. Something went wrong.' })
    }

    public respondWithNotFound(res: Response) {
        return res.status(404).json({ message: 'Not found' })
    }

    private getResponsePayload(err: AppError): object {
        switch (err.type) {
            case ErrorTypes.ValidationFailed:
                return { errors: err.data?.errors }
            default:
                return {}
        }
    }
}

export const errorHandler = () => {}
