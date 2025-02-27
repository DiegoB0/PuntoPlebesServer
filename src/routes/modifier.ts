import { Router } from 'express'
import {
  addItems,
  getItems,
  getItem,
  updateItems,
  removeItems
} from '../controllers/modifier'
import { apiKeyMiddleware } from '../middlewares/apiKey'
import { checkJwt } from '../middlewares/sessions'

const router = Router()

/**
 * @swagger
 * tags:
 *   - name: Modifiers
 *     description: Endpoints for managing modifiers
 */

/**
 * @swagger
 * /modifier:
 *   post:
 *     summary: Add a new modifier
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags:
 *       - Modifiers
 *     description: Creates a new modifier with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertModifierDTO'
 *           example:
 *             name: "Bien caliente"
 *             description: "Representa ..."
 *             meal_type: "Comida"
 *             claveData:
 *               palabra: "Bien calienta"
 *               clave: "B ca"
 *     responses:
 *       201:
 *         description: Successfully created a modifier.
 *       400:
 *         description: Invalid request data.
 *       500:
 *         description: Internal server error.
 */
router.post('/', apiKeyMiddleware, checkJwt, addItems)

/**
 * @swagger
 * /modifier:
 *   get:
 *     summary: Get all modifiers
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags:
 *       - Modifiers
 *     description: Retrieves a list of all available modifiers.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list.
 *       500:
 *         description: Internal server error.
 */
router.get('/', apiKeyMiddleware, checkJwt, getItems)

/**
 * @swagger
 * /modifier/{id}:
 *   get:
 *     summary: Get a modifier by ID
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags:
 *       - Modifiers
 *     description: Retrieves a single modifier by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the modifier
 *     responses:
 *       200:
 *         description: Successfully retrieved the modifier.
 *       404:
 *         description: Modifier not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', apiKeyMiddleware, checkJwt, getItem)

/**
 * @swagger
 * /modifier/{id}:
 *   patch:
 *     summary: Update a modifier
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags:
 *       - Modifiers
 *     description: Updates an existing modifier with new details.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateModifierDTO'
 *             name: "Bien caliente"
 *             description: "Representa ..."
 *             meal_type: "Comida"
 *             claveData:
 *               palabra: "Bien calienta"
 *               clave: "B ca"
 *     responses:
 *       200:
 *         description: Successfully updated the modifier.
 *       400:
 *         description: Invalid request data.
 *       404:
 *         description: Modifier not found.
 *       500:
 *         description: Internal server error.
 */
router.patch('/:id', apiKeyMiddleware, checkJwt, updateItems)

/**
 * @swagger
 * /modifier/{id}:
 *   delete:
 *     summary: Delete a modifier
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags:
 *       - Modifiers
 *     description: Deletes a modifier by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the modifier
 *     responses:
 *       200:
 *         description: Successfully deleted the modifier.
 *       404:
 *         description: Modifier not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id', apiKeyMiddleware, checkJwt, removeItems)

export { router }

/**
 * @swagger
 * components:
 *   schemas:
 *     ClaveDTO:
 *       type: object
 *       properties:
 *         palabra:
 *           type: string
 *           example: "word"
 *         clave:
 *           type: string
 *           example: "12345"
 *     InsertModifierDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Modifier Name"
 *         description:
 *           type: string
 *           example: "Detailed description of the modifier"
 *         meal_type:
 *           type: string
 *           enum:
 *             - BREAKFAST
 *             - LUNCH
 *             - DINNER
 *           example: "LUNCH"
 *         claveData:
 *           $ref: '#/components/schemas/ClaveDTO'
 *     UpdateModifierDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Updated Modifier Name"
 *         description:
 *           type: string
 *           example: "Updated description of the modifier"
 *         meal_type:
 *           type: string
 *           enum:
 *             - BREAKFAST
 *             - LUNCH
 *             - DINNER
 *           example: "DINNER"
 *         claveData:
 *           $ref: '#/components/schemas/ClaveDTO'
 */
