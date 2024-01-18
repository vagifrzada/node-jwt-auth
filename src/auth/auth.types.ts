import { Types } from 'mongoose'

export type UserDocument = {
    _id?: Types.ObjectId
    email: string
    password: string
    role: string
    createdAt: Date
}
