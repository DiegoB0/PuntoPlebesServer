import { Request, Response } from 'express'
import { handleHttp } from '../utils/error_handler'
import {
  deleteUser,
  getUserById,
  getUsers,
  insertUser,
  updateUser
} from '../services/user'
import {
  validateCreateUser,
  validateUpdateUser
} from '../utils/user_validator_handler'
import { User } from '../interfaces/user.interface'

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

const getItems = async (req: Request, res: Response) => {
  try {
    const items = await getUsers()
    res.status(200).json(items)
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'FAILED_TO_FETCH_USERS':
          return handleHttp(res, 'FAILED_TO_FETCH_USERS', 500)
        case 'UNKNOWN_ERROR':
          return handleHttp(res, 'UNKNOWN_ERROR', 500)
        default:
          return handleHttp(res, 'INTERNAL_SERVER_ERROR', 500)
      }
    } else {
      return handleHttp(res, 'INTERNAL_SERVER_ERROR', 500)
    }
  }
}

const addItems = async (req: Request, res: Response) => {
  try {
    const body: User = req.body

    // Validate the user data
    const { error } = validateCreateUser(body)
    if (error) {
      return handleHttp(res, error.details[0].message, 400)
    }

    const responseItem = await insertUser(body)
    res.status(201).json(responseItem)
  } catch (e: any) {
    switch (e.message) {
      case 'FAILED_EMAIL_CHECK':
        return handleHttp(res, 'Failed to check the email.', 500)
      case 'EMAIL_ALREADY_EXISTS':
        return handleHttp(res, 'Email already exists.', 400)
      case 'FAILED_TO_INSERT_USER':
        return handleHttp(res, 'Failed to insert user.', 500)
      default:
        return handleHttp(res, 'INTERNAL_SERVER_ERROR', 500)
    }
  }
}

const changeItems = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id
    const body: User = req.body

    const { error } = validateUpdateUser(body)
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

const removeItems = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id

    const { success, message, error } = await deleteUser(itemId)

    // Display errors depending on the service response
    if (!success) {
      switch (error) {
        case 'ITEM_NOT_FOUND':
          return handleHttp(res, 'Item not found.', 404)
        case 'DELETE_ERROR':
          return handleHttp(res, 'Failed to delete item.', 500)
        case 'FETCH_ERROR':
          return handleHttp(res, 'Failed to check item existence.', 500)
        default:
          return handleHttp(res, 'Internal server error.', 500)
      }
    }

    res.status(200).json(message)
  } catch (e) {
    console.error('Unexpected error in removeItems:', e)
    handleHttp(res, 'INTERNAL_SERVER_ERROR', 500)
  }
}

export { getItem, getItems, addItems, changeItems, removeItems }
