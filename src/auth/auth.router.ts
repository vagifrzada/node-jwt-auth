import Router from 'express'
import mongoose from 'mongoose'
import AuthHandler from './auth.handler'
import AuthService from './auth.service'
import { validate } from '../core/validator'
import UserRepository from './repositories/user.repository'
import { signupValidationSchema } from './validation/signup-validation.schema'
import { signInValidationSchema } from './validation/signin-validation.schema'

const router = Router()

const collection: mongoose.Collection = mongoose.connection.collection('users')
const userRepository: UserRepository = new UserRepository(collection)

const authHandler: AuthHandler = new AuthHandler(new AuthService(userRepository))

router.post('/register', validate(signupValidationSchema), authHandler.register.bind(authHandler))
router.post('/login', validate(signInValidationSchema), authHandler.login.bind(authHandler))
router.post('/refresh-token', authHandler.refreshToken.bind(authHandler))
router.post('/revoke-token', authHandler.revokeToken.bind(authHandler))

export default router
