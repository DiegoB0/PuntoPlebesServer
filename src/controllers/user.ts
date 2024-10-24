import { Request, Response } from 'express'
import { handleHttp } from '../utils/error_handler'
import {
  deleteUser,
  getUserById,
  getUsers,
  insertUser,
  updateUser
} from '../services/user'
import { validateUser } from '../utils/users_validator_handle'
import { User } from '../interfaces/user.interface'

/**
 * Get a single item by ID
 * @route GET /user/:id
 * @param {Request} req - Express request object
 * @param {string} req.params.id - ID of the item to fetch
 * @param {Response} res - Express response object
 * @returns {Object} 200 - The item details
 * @returns {Error} 404 - Item not found
 * @returns {Error} 500 - Internal server error
 */
const getItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id
    const item = await getUserById(itemId)

    if (!item) {
      return handleHttp(res, 'ITEM_NOT_FOUND', 404)
    }

    res.status(200).json(item)
  } catch (e) {
    console.error(e)
    handleHttp(res, 'INTERNAL_SERVER_ERROR', 500)
  }
}

/**
 * Get all items
 * @route GET /user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Array<Object>} 200 - An array of items
 * @returns {Error} 500 - Internal server error
 */
const getItems = async (req: Request, res: Response) => {
  try {
    const items = await getUsers()
    res.status(200).json(items)
  } catch (e) {
    console.error(e)
    handleHttp(res, 'INTERNAL_SERVER_ERROR', 500)
  }
}

/**
 * Add a new item
 * @route PUT /user
 * @param {Request} req - Express request object
 * @param {Object} req.body - The new item data
 * @param {Response} res - Express response object
 * @returns {Object} 201 - The newly created item
 * @returns {Error} 400 - Invalid request data
 * @returns {Error} 500 - Internal server error
 */
const addItems = async (req: Request, res: Response) => {
  try {
    const body: User = req.body

    const { error } = validateUser(body)
    if (error) {
      return handleHttp(res, error.details[0].message, 400)
    }

    const responseItem = await insertUser(body)
    res.status(201).json(responseItem)
  } catch (e) {
    console.error(e)
    handleHttp(res, 'INTERNAL_SERVER_ERROR', 500)
  }
}

/**
 * Update an existing item
 * @route POST /user/:id
 * @param {Request} req - Express request object
 * @param {Object} req.body - The updated item data
 * @param {Response} res - Express response object
 * @returns {Object} 200 - The updated item
 * @returns {Error} 400 - Invalid request data
 * @returns {Error} 500 - Internal server error
 */
const changeItems = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id
    const body: User = req.body

    const { error } = validateUser(body)
    if (error) {
      return handleHttp(res, error.details[0].message, 400)
    }

    const updatedItem = await updateUser(itemId, body)
    if (!updatedItem) {
      return handleHttp(res, 'ITEM_NOT_FOUND', 404)
    }

    res.status(200).json(updatedItem)
  } catch (e) {
    console.error(e)
    handleHttp(res, 'INTERNAL_SERVER_ERROR', 500)
  }
}

/**
 * Delete an item by ID
 * @route DELETE /user/:id
 * @param {Request} req - Express request object
 * @param {string} req.params.id - ID of the item to delete
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Confirmation of deletion
 * @returns {Error} 404 - Item not found
 * @returns {Error} 500 - Internal server error
 */
const removeItems = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id
    const deleted = await deleteUser(itemId)

    if (!deleted) {
      return handleHttp(res, 'ITEM_NOT_FOUND', 404)
    }

    res.status(200).json({ message: 'Item deleted successfully.' })
  } catch (e) {
    console.error(e)
    handleHttp(res, 'INTERNAL_SERVER_ERROR', 500)
  }
}

export { getItem, getItems, addItems, changeItems, removeItems }
