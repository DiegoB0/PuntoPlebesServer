import { Router } from 'express'
import {
  loginController,
  refreshTokenController,
  createApiKeyController
} from '../controllers/auth'
import { apiKeyMiddleware } from '../middlewares/apiKey'
import { checkJwt } from '../middlewares/sessions'

const router = Router()

/**
 * @swagger
 * /auth/create-api-key:
 *   post:
 *     summary: Generate API Key
 *     tags:
 *       - Auth
 *     description: Generates an API key after verifying user credentials.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 */
router.post('/create-api-key', createApiKeyController)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Auth
 *     description: Authenticates a user and returns a token.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "yourSecurePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation error – Invalid input data
 *       401:
 *         description: Unauthorized – Invalid email or password
 *       404:
 *         description: Not Found – User not found
 *       500:
 *         description: Internal Server Error – Unexpected error
 */
router.post('/login', apiKeyMiddleware, loginController)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT Token
 *     tags:
 *       - Auth
 *     description: Refreshes the access token using a valid refresh token.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshTokenKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully.
 *       401:
 *         description: Invalid refresh token.
 *       500:
 *         description: Internal server error.
 */
router.post('/refresh', apiKeyMiddleware, checkJwt, refreshTokenController)

export { router }

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginUserDTO:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "yourSecurePassword123"
 */
