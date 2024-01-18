import AppError from './app.error'
import { ZodError, ZodSchema } from 'zod'
import { ErrorTypes } from '../common/enums'
import { ValidationError } from '../common/types'
import { Request, Response, NextFunction } from 'express'

const prepareValidationErrors = (error: ZodError): ValidationError[] => {
    return error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }))
}

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const result = schema.parse(req.body)
            req.validatedBody = result
            next()
        } catch (err) {
            const errors: ValidationError[] = prepareValidationErrors(err as ZodError)

            return next(
                new AppError({
                    message: 'Validation failed',
                    type: ErrorTypes.ValidationFailed,
                    statusCode: 400,
                    data: { errors },
                })
            )
        }
    }
}
