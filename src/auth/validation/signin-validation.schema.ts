import { z } from 'zod'

export const signInValidationSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
})
// .refine(
//     (data) => {
//         // Implement email checking logic here.
//         return data.email === 'v.rufullazada@gmail.com'
//     },
//     { message: 'User not found', path: ['email'] }
// )

export type SignInDto = z.infer<typeof signInValidationSchema>
