import { Router } from 'express'
import {
  addItems,
  getItems,
  getItem,
  updateItems,
  removeItems
} from '../controllers/user'
import { apiKeyMiddleware } from '../middlewares/apiKey'
import { checkJwt } from '../middlewares/sessions'

const router = Router()

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: API endpoints for managing users
 */

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertUserDTO'
 *           example:
 *             name: "John Doe"
 *             email: "john@example.com"
 *             password: "password123"
 *             role: "admin"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', apiKeyMiddleware, checkJwt, addItems)

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all users
 *       500:
 *         description: Internal server error
 */
router.get('/', apiKeyMiddleware, checkJwt, getItems)

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', apiKeyMiddleware, checkJwt, getItem)

/**
 * @swagger
 * /user/{id}:
 *   patch:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDTO'
 *           example:
 *             name: "Jane Doe"
 *             email: "jane@example.com"
 *             password: "newpassword123"
 *             role: "admin"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', apiKeyMiddleware, checkJwt, updateItems)

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', apiKeyMiddleware, checkJwt, removeItems)

export { router }

/**
 * @swagger
 * components:
 *   schemas:
 *     InsertUserDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           example: "password123"
 *         role:
 *           type: string
 *           enum:
 *             - ADMIN
 *             - USER
 *           example: "USER"
 *     UpdateUserDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           example: "jane@example.com"
 *         password:
 *           type: string
 *           example: "newpassword123"
 *         role:
 *           type: string
 *           enum:
 *             - ADMIN
 *             - USER
 *           example: "ADMIN"
 */
