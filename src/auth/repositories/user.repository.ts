import User from '../user.entity'
import { Roles } from '../roles.enum'
import { Collection } from 'mongoose'
import { UserDocument } from '../auth.types'

export default class UserRepository {
    constructor(private readonly userCollection: Collection) {}

    public async find(params: object): Promise<User | null> {
        const userDoc: any = await this.userCollection.findOne(params)
        if (!userDoc) {
            return null
        }

        const user: User = new User()
        user.setId(userDoc._id)
        user.setEmail(userDoc.email)
        user.setPassword(userDoc.password)
        user.setRole(userDoc.role as Roles)
        user.setCreatedAt(userDoc.createdAt)
        return user
    }

    public async create(data: UserDocument): Promise<User> {
        const result: any = await this.userCollection.insertOne(data)
        const user: User = new User()
        user.setId(result.insertedId)
        user.setEmail(data.email)
        user.setPassword(data.password)
        user.setRole(data.role as Roles)
        user.setCreatedAt(data.createdAt)
        return user
    }
}
