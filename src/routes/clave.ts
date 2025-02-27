import { Router } from 'express'
import {
  addItems,
  getItems,
  getItem,
  updateItems,
  removeItems
} from '../controllers/clave'
import { apiKeyMiddleware } from '../middlewares/apiKey'
import { checkJwt } from '../middlewares/sessions'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Claves
 *   description: API endpoints for managing claves
 */

/**
 * @swagger
 * /clave:
 *   post:
 *     summary: Create a new clave
 *     tags: [Claves]
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
 *               palabra:
 *                 type: string
 *                 example: "Mayonesa"
 *               clave:
 *                 type: string
 *                 example: "may"
 *     responses:
 *       201:
 *         description: Clave created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', apiKeyMiddleware, checkJwt, addItems)

/**
 * @swagger
 * /clave:
 *   get:
 *     summary: Get all claves
 *     tags: [Claves]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of claves
 *       500:
 *         description: Server error
 */
router.get('/', apiKeyMiddleware, checkJwt, getItems)

/**
 * @swagger
 * /clave/{id}:
 *   get:
 *     summary: Get a clave by ID
 *     tags: [Claves]
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
 *         description: Clave found
 *       404:
 *         description: Clave not found
 *       500:
 *         description: Server error
 */
router.get('/:id', apiKeyMiddleware, checkJwt, getItem)

/**
 * @swagger
 * /clave/{id}:
 *   patch:
 *     summary: Update a clave by ID
 *     tags: [Claves]
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
 *             type: object
 *             properties:
 *               palabra:
 *                 type: string
 *                 example: "Mayonesa"
 *               clave:
 *                 type: string
 *                 example: "may"
 *     responses:
 *       200:
 *         description: Clave updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Clave not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', apiKeyMiddleware, checkJwt, updateItems)

/**
 * @swagger
 * /clave/{id}:
 *   delete:
 *     summary: Delete a clave by ID
 *     tags: [Claves]
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
 *         description: Clave deleted successfully
 *       404:
 *         description: Clave not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', apiKeyMiddleware, checkJwt, removeItems)

export { router }

/**
 * @swagger
 * components:
 *   schemas:
 *     InsertClaveDTO:
 *       type: object
 *       properties:
 *         palabra:
 *           type: string
 *           example: "Ejemplo palabra"
 *         clave:
 *           type: string
 *           example: "Ejemplo clave"
 *     UpdateClaveDTO:
 *       type: object
 *       properties:
 *         palabra:
 *           type: string
 *           example: "Nueva palabra"
 *         clave:
 *           type: string
 *           example: "Nueva clave"
 */
