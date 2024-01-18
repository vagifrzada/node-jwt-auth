import { z } from 'zod'

export const signupValidationSchema = z
    .object({
        name: z.string().min(3).max(100),
        email: z.string().email(),
        password: z.string().min(6).max(100),
        passwordConfirmation: z.string().min(6).max(100),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        message: "Passwords don't match",
        path: ['passwordConfirmation'],
    })

export type SignUpDto = z.infer<typeof signupValidationSchema>
