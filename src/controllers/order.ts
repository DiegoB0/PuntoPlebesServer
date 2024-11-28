import { Request, Response } from 'express'
import {
  insertOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getReports,
  getStatistics
} from '../services/order'
import { handleHttp } from '../utils/error_handler'
import { Order } from '../interfaces/order.interface'
import {
  validateOrder,
  validateUpdateOrder
} from '../utils/validations/order_validator_handler'

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
    const order = req.body

    // Validate the incoming order data
    const { error } = validateUpdateOrder(order)
    if (error) {
      return handleHttp(res, error.details[0].message, 400)
    }

    // Attempt to update the order
    const updatedOrder = await updateOrder(id, order)

    // If successful, return the updated order
    return res.status(200).json(updatedOrder)
  } catch (err: unknown) {
    if (err instanceof Error) {
      switch (err.message) {
        case 'FAILED_TO_FETCH_ORDER':
          return handleHttp(res, 'Order could not be fetched', 500)
        case 'ORDER_NOT_FOUND':
          return handleHttp(res, 'Order not found', 404)
        case 'FAILED_TO_UPDATE_ORDER':
          return handleHttp(res, 'Failed to update order', 500)
        case 'FAILED_TO_UPDATE_ORDER_ITEM':
          return handleHttp(res, 'Failed to update order item', 500)
        case 'FAILED_TO_INSERT_ORDER_ITEM':
          return handleHttp(res, 'Failed to insert new order item', 500)
        case 'FAILED_TO_INSERT_DETAIL':
          return handleHttp(res, 'Failed to insert order item details', 500)
        case 'FAILED_TO_FETCH_MEAL_PRICE':
          return handleHttp(res, 'Error fetching meal price', 500)
        case 'FAILED_TO_UPDATE_PAYMENT':
          return handleHttp(res, 'Failed to update payment', 500)
        case 'INSUFFICIENT_PAYMENT_ERROR':
          return handleHttp(res, 'Insufficient payment', 400)
        case 'FAILED_TO_INSERT_PAYMENT':
          return handleHttp(res, 'Failed to insert payment', 500)
        default:
          return handleHttp(res, 'Internal server error', 500)
      }
    }
    return handleHttp(res, 'An unexpected error occurred', 500)
  }
}

const removeItems = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id

    const { success, message, error } = await deleteOrder(itemId)

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

const getReportItems = async (req: Request, res: Response) => {
  try {

    const period = req.query.period as 'day' | 'week' | 'month' || 'day'
    // Get statistics from the service
    const reportsData = await getReports(period)
    res.status(200).json(reportsData)
  } catch (error) {
    if (error instanceof Error) {
      // Handle errors based on their message
      switch (error.message) {
        case 'FAILED_TO_FETCH_STATICS':
          return handleHttp(res, 'FAILED_TO_FETCH_STATICS', 500); // Custom error for failed statics
        case 'UNKNOWN_ERROR':
          return handleHttp(res, 'UNKNOWN_ERROR', 500);
        default:
          return handleHttp(res, 'INTERNAL_SERVER_ERROR', 500);
      }
    }
  }
}

const getStaticsItems = async (req: Request, res: Response) => {
  try {

    const stats = await getStatistics();
    res.status(200).json(stats);

  } catch (error) {
    console.error('Error in getStaticsItems controller:', error); // Log error in controller
    if (error instanceof Error) {
      switch (error.message) {
        case 'FAILED_TO_FETCH_TOP_SELLERS':
          return handleHttp(res, 'Failed to fetch top sellers', 500);
        case 'FAILED_TO_FETCH_SALES_BY_PERIOD':
          return handleHttp(res, 'Failed to fetch sales by period', 500);
        case 'FAILED_TO_FETCH_AVERAGE_QUANTITY':
          return handleHttp(res, 'Failed to fetch average quantity', 500);
        case 'FAILED_TO_FETCH_TOTAL_SALES_PER_PRODUCT':
          return handleHttp(res, 'Failed to fetch total sales per product', 500);
        case 'FAILED_TO_FETCH_ALL_SALES_DATA':
          return handleHttp(res, 'Failed to fetch all sales data', 500);
        default:
          return handleHttp(res, 'INTERNAL_SERVER_ERROR', 500);
      }
    } else {
      return handleHttp(res, 'UNKNOWN_ERROR', 500);
    }
  }
}

export { addItems, getItems, getItem, changeItems, removeItems, getReportItems, getStaticsItems }
