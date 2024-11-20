import { Request, Response } from 'express'
import {
  insertOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} from '../services/order'
import { handleHttp } from '../utils/error_handler'
import { Order } from '../interfaces/order.interface'
import { validateOrder } from '../utils/validations/order_validator_handler'

const addItems = async (req: Request, res: Response) => {
  try {
    const body: Order = req.body

    const { error } = validateOrder(body)
    if (error) {
      return handleHttp(res, error.details[0].message, 400)
    }

    const responseItem = await insertOrder(body)
    res.status(201).json(responseItem)
  } catch (e: any) {
    switch (e.message) {
      case 'ORDER_INSERT_ERROR':
        return handleHttp(res, 'Failed to insert order data', 500)
      case 'ORDER_RETRIEVE_ERROR':
        return handleHttp(res, 'Failed to retrieve order information', 500)
      case 'MEAL_FETCH_ERROR':
        return handleHttp(res, 'Meal not found', 404)
      case 'ORDER_ITEM_INSERT_ERROR':
        return handleHttp(res, 'Failed to insert order item', 500)
      case 'ORDER_ITEM_DETAILS_INSERT_ERROR':
        return handleHttp(res, 'Failed to insert order item details', 500)
      case 'ORDER_TOTAL_UPDATE_ERROR':
        return handleHttp(res, 'Failed to update order total price', 500)
      case 'PAYMENTS_INSERT_ERROR':
        return handleHttp(res, 'Failed to process payments', 500)
      case 'INSUFFICIENT_PAYMENT_ERROR':
        return handleHttp(res, 'Payment amount is insufficient', 400)
      default:
        return handleHttp(res, 'An unexpected error occurred', 500)
    }
  }
}

const getItems = async (req: Request, res: Response) => {
  try {
    const items = await getOrders()

    return res.status(200).json(items)
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'FAILED_TO_FETCH_ORDERS':
          return handleHttp(res, 'FAILED_TO_FETCH_ORDERS', 500)
        case 'NO_ORDER_FOUND':
          return handleHttp(res, 'NO_ORDER_FOUND', 404)
        case 'FAILED_TO_FETCH_MEALS':
          return handleHttp(res, 'FAILED_TO_FETCH_MEALS', 500)
        case 'FAILED_TO_FETCH_ORDER_ITEM_DETAILS':
          return handleHttp(res, 'FAILED_TO_FETCH_ORDER_ITEM_DETAILS', 500)
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

const getItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id
    const item = await getOrderById(itemId)

    if (!item) {
      return handleHttp(res, 'ITEM_NOT_FOUND', 404)
    }

    res.status(200).json(item)
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'FAILED_TO_FETCH_ORDER':
          return handleHttp(res, 'FAILED_TO_FETCH_ORDER', 500)
        case 'ORDER_NOT_FOUND':
          return handleHttp(res, 'ORDER_NOT_FOUND', 404)
        case 'FAILED_TO_FETCH_MEALS':
          return handleHttp(res, 'FAILED_TO_FETCH_MEALS', 500)
        case 'FAILED_TO_FETCH_ORDER_ITEM_DETAILS':
          return handleHttp(res, 'FAILED_TO_FETCH_ORDER_ITEM_DETAILS', 500)
        case 'UNKNOWN_ERROR':
          return handleHttp(res, 'UNKNOWN_ERROR', 500)
        default:
          return handleHttp(res, 'INTERNAL_SERVER_ERROR', 500)
      }
    }
  }
}

const changeItems = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { order } = req.body

    console.log('Request body:', req.body)

    if (!order || Object.keys(order).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' })
    }

    const updatedOrder = await updateOrder(id, order)
    return res.status(200).json(updatedOrder)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message })
    }
    return res.status(500).json({ message: 'An unknown error occurred' })
  }
}

const removeItems = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id

    const { success, message, error } = await deleteOrder(itemId)

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

export { addItems, getItems, getItem, changeItems, removeItems }
