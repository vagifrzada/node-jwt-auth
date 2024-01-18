import { Roles } from './roles.enum'

export default class User {
    private id: string
    private email: string
    private password: string
    private role: Roles
    private createdAt: Date

    public setId(id: string) {
        this.id = id
    }

    public setEmail(email: string) {
        this.email = email
    }

    public getId(): string {
        return this.id
    }

    public getEmail(): string {
        return this.email
    }

    public setPassword(password: string) {
        this.password = password
    }

    public getPassword(): string {
        return this.password
    }

    public setRole(role: Roles) {
        this.role = role
    }

    public getRole(): Roles {
        return this.role
    }

    public setCreatedAt(createdAt: Date) {
        this.createdAt = createdAt
    }

    public getCreatedAt(): Date {
        return this.createdAt
    }
}
