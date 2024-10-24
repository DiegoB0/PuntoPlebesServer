import { Router } from 'express'
import { loginController, registerController } from '../controllers/auth'

const router = Router()

/**
 * http://localhost:5000/auth/register [POST]
 */
router.post('/register', registerController)

/**
 * http://localhost:5000/auth/login [POST]
 */
router.post('/login', loginController)

export { router }
