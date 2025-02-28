import express from 'express'
import {
  addItems,
  getItems,
  getItem,
  removeItems,
  updateItems,
  getReportItems,
  getNextOrderNumberController
} from '../controllers/order'
import { apiKeyMiddleware } from '../middlewares/apiKey'
import { checkJwt } from '../middlewares/sessions'

const router = express.Router()
/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: API endpoints for managing orders
 */

/**
 * @swagger
 * /order/last:
 *   post:
 *     summary: Get the next order number
 *     tags: [Orders]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the next order number
 *       500:
 *         description: Internal server error
 */
router.get('/last', apiKeyMiddleware, checkJwt, getNextOrderNumberController)

/**
 * @swagger
 * /order/reportes:
 *   get:
 *     summary: Get order reports
 *     tags: [Orders]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of order reports
 *       500:
 *         description: Internal server error
 */
router.get('/reportes', apiKeyMiddleware, checkJwt, getReportItems)

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertOrderDTO'
 *           example:
 *             order_status: "En proceso"
 *             client_name: "Diego Elizalde"
 *             client_phone: "+1234567890"
 *             items: [
 *               { meal_id: 1, quantity: 3, details: ["extra sauce", "no onions"] },
 *               { meal_id: 1, quantity: 1, details: ["extra cheese"] }
 *             ]
 *             payments: [
 *               { payment_method: "tarjeta", amount_given: 300 }
 *             ]
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', apiKeyMiddleware, checkJwt, addItems)

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders
 *       500:
 *         description: Internal server error
 */
router.get('/', apiKeyMiddleware, checkJwt, getItems)

/**
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
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
 *         description: Order found
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', apiKeyMiddleware, checkJwt, getItem)

/**
 * @swagger
 * /order/{id}:
 *   patch:
 *     summary: Update an order by ID
 *     tags: [Orders]
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
 *             $ref: '#/components/schemas/UpdateOrderDTO'
 *           example:
 *             order_status: "Completed"
 *             client_name: "Diego Elizalde"
 *             client_phone: "+1234567890"
 *             items: [
 *               { meal_id: 1, quantity: 2, details: ["extra cheese"] }
 *             ]
 *             payments: [
 *               { payment_method: "credit card", amount_given: 150 }
 *             ]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', apiKeyMiddleware, checkJwt, updateItems)

/**
 * @swagger
 * /order/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     tags: [Orders]
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
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', apiKeyMiddleware, checkJwt, removeItems)

export { router }

/**
 * @swagger
 * components:
 *   schemas:
 *     InsertOrderDTO:
 *       type: object
 *       properties:
 *         client_name:
 *           type: string
 *           example: "Diego Elizalde"
 *         client_phone:
 *           type: string
 *           example: "+1234567890"
 *         order_status:
 *           type: string
 *           example: "En proceso"
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               meal_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 3
 *               details:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["extra sauce", "no onions"]
 *         payments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               payment_method:
 *                 type: string
 *                 example: "tarjeta"
 *               amount_given:
 *                 type: integer
 *                 example: 300
 *     UpdateOrderDTO:
 *       type: object
 *       properties:
 *         client_name:
 *           type: string
 *           example: "Diego Elizalde"
 *         client_phone:
 *           type: string
 *           example: "+1234567890"
 *         order_status:
 *           type: string
 *           example: "Completed"
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               meal_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               details:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["extra cheese"]
 *         payments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               payment_method:
 *                 type: string
 *                 example: "credit card"
 *               amount_given:
 *                 type: integer
 *                 example: 150
 */
