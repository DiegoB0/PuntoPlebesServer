import { Router } from 'express'
import {
  addItems,
  getItems,
  getItem,
  updateItems,
  removeItem
} from '../controllers/meal'
import { apiKeyMiddleware } from '../middlewares/apiKey'
import { checkJwt } from '../middlewares/sessions'

const router = Router()

/**
 * @swagger
 * tags:
 *   - name: Meals
 *     description: Endpoints for managing meals
 */

/**
 * @swagger
 * /meal:
 *   post:
 *     summary: Add a new meal
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags:
 *       - Meals
 *     description: Creates a new meal with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertMealDTO'
 *           example:
 *             name: "La Consentida"
 *             description: "Hamburguesa con doble carne"
 *             categoryId: 1
 *             image_url: "image_url"
 *             price: 50
 *             isClaveApplied: true
 *             palabra: "Consentida"
 *             clave: "con"
 *     responses:
 *       201:
 *         description: Successfully created a meal.
 *       400:
 *         description: Invalid request data.
 *       500:
 *         description: Internal server error.
 */
router.post('/', apiKeyMiddleware, checkJwt, addItems)

/**
 * @swagger
 * /meal:
 *   get:
 *     summary: Get all meals
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags:
 *       - Meals
 *     description: Retrieves a list of all meals.
 *     responses:
 *       200:
 *         description: Successfully retrieved meals.
 *       500:
 *         description: Internal server error.
 */
router.get('/', apiKeyMiddleware, checkJwt, getItems)

/**
 * @swagger
 * /meal/{id}:
 *   get:
 *     summary: Get a single meal by ID
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags:
 *       - Meals
 *     description: Retrieves the details of a specific meal.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the meal
 *     responses:
 *       200:
 *         description: Successfully retrieved the meal.
 *       404:
 *         description: Meal not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', apiKeyMiddleware, checkJwt, getItem)

/**
 * @swagger
 * /meal/{id}:
 *   patch:
 *     summary: Update a meal
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags:
 *       - Meals
 *     description: Updates an existing meal with new details.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the meal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMealDTO'
 *           example:
 *             name: "La Consentida"
 *             description: "Hamburguesa con doble carne"
 *             categoryId: 1
 *             image_url: "image_url"
 *             price: 50
 *             isClaveApplied: true
 *             palabra: "Consentida"
 *             clave: "con"
 *     responses:
 *       200:
 *         description: Successfully updated the meal.
 *       400:
 *         description: Invalid request data.
 *       404:
 *         description: Meal not found.
 *       500:
 *         description: Internal server error.
 */
router.patch('/:id', apiKeyMiddleware, checkJwt, updateItems)

/**
 * @swagger
 * /meal/{id}:
 *   delete:
 *     summary: Remove a meal
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     tags:
 *       - Meals
 *     description: Deletes an existing meal by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the meal
 *     responses:
 *       200:
 *         description: Successfully deleted the meal.
 *       404:
 *         description: Meal not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id', apiKeyMiddleware, checkJwt, removeItem)

export { router }

/**
 * @swagger
 * components:
 *   schemas:
 *     InsertMealDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Vegan Burger"
 *         description:
 *           type: string
 *           example: "A delicious vegan burger."
 *         categoryId:
 *           type: integer
 *           example: 1
 *         image_url:
 *           type: string
 *           example: "https://example.com/image.jpg"
 *         image_id:
 *           type: integer
 *           example: 12345
 *         price:
 *           type: integer
 *           example: 10
 *         isClaveApplied:
 *           type: boolean
 *           example: true
 *         palabra:
 *           type: string
 *           example: "vegan"
 *         clave:
 *           type: string
 *           example: "burger123"
 *     UpdateMealDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Updated Vegan Burger"
 *         description:
 *           type: string
 *           example: "An even more delicious vegan burger."
 *         categoryId:
 *           type: integer
 *           example: 1
 *         image_url:
 *           type: string
 *           example: "https://example.com/updated_image.jpg"
 *         image_id:
 *           type: integer
 *           example: 12346
 *         price:
 *           type: integer
 *           example: 12
 *         isClaveApplied:
 *           type: boolean
 *           example: false
 *         palabra:
 *           type: string
 *           example: "updatedVegan"
 *         clave:
 *           type: string
 *           example: "updatedBurger123"
 */
