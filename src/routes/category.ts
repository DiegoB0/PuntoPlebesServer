import { Router } from 'express'
import {
  addItems,
  getItems,
  getItem,
  updateItems,
  removeItems
} from '../controllers/category'
import { apiKeyMiddleware } from '../middlewares/apiKey'
import { checkJwt } from '../middlewares/sessions'

const router = Router()

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Endpoints for managing categories
 */

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Add a new category
 *     tags:
 *       - Categories
 *     description: Creates a new category with the provided details.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertCategoryDTO'
 *           example:
 *             category_name: "Hamburguesa"
 *             menu_type: "Comida"
 *     responses:
 *       201:
 *         description: Successfully created a category.
 *       400:
 *         description: Invalid request data.
 *       500:
 *         description: Internal server error.
 */
router.post('/', apiKeyMiddleware, checkJwt, addItems)

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories
 *     tags:
 *       - Categories
 *     description: Retrieves a list of all categories.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved categories.
 *       500:
 *         description: Internal server error.
 */
router.get('/', apiKeyMiddleware, checkJwt, getItems)

/**
 * @swagger
 * /category/{id}:
 *   get:
 *     summary: Get a single category by ID
 *     tags:
 *       - Categories
 *     description: Retrieves the details of a specific category.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the category
 *     responses:
 *       200:
 *         description: Successfully retrieved the category.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', apiKeyMiddleware, checkJwt, getItem)

/**
 * @swagger
 * /category/{id}:
 *   patch:
 *     summary: Update a category
 *     tags:
 *       - Categories
 *     description: Updates an existing category with new details.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryDTO'
 *           example:
 *             category_name: "Hotdogs"
 *             menu_type: "Comida"
 *     responses:
 *       200:
 *         description: Successfully updated the category.
 *       400:
 *         description: Invalid request data.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Internal server error.
 */
router.patch('/:id', apiKeyMiddleware, checkJwt, updateItems)

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Remove a category
 *     tags:
 *       - Categories
 *     description: Deletes an existing category by ID.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the category
 *     responses:
 *       200:
 *         description: Successfully deleted the category.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id', apiKeyMiddleware, checkJwt, removeItems)

export { router }

/**
 * @swagger
 * components:
 *   schemas:
 *     InsertCategoryDTO:
 *       type: object
 *       properties:
 *         category_name:
 *           type: string
 *           example: "Vegan"
 *         menu_type:
 *           type: string
 *           enum: [BREAKFAST, LUNCH, DINNER]
 *           example: "LUNCH"
 *     UpdateCategoryDTO:
 *       type: object
 *       properties:
 *         category_name:
 *           type: string
 *           example: "Updated Vegan"
 *         menu_type:
 *           type: string
 *           enum: [BREAKFAST, LUNCH, DINNER]
 *           example: "DINNER"
 */
