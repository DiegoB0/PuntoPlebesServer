import { Router } from 'express'
import { loginController, registerController, refreshTokenController } from '../controllers/auth'

const router = Router()

/**
 * http://localhost:5000/auth/register [POST]
 */
router.post('/register', registerController)

/**
 * http://localhost:5000/auth/login [POST]
 */
router.post('/login', loginController)

/**
 * http://localhost:5000/auth/refresh-token [POST]
 */
router.post('/refresh-token', refreshTokenController)

export { router }
