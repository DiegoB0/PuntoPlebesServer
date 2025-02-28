import { Request, Response } from 'express'
import {
  insertOrder,
  getOrders,
  getOrderById,
  deleteOrder,
  updateOrder,
  getSalesByPeriod,
  getLastOrderNumber,
  getNextOrderNumber
} from '../services/order'
import { handleHttp } from '../utils/error_handler'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { InsertOrderDTO, UpdateOrderDTO } from '../dtos/order/request.dto'

const getNextOrderNumberController = async (req: Request, res: Response) => {
  try {
    const nextOrderNumber = await getNextOrderNumber()
    res.status(200).json(nextOrderNumber)
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMap: Record<string, number> = {
        FAILED_TO_FETCH_NEXT_ORDER_NUMBER: 500,
        UNKNOWN_ERROR: 500
      }
      const statusCode = errorMap[error.message] || 500
      return handleHttp(res, error.message, statusCode, error)
    }

    handleHttp(res, 'Internal Server Error', 500, error)
  }
}

const getLastOrderNumberController = async (req: Request, res: Response) => {
  try {
    const lastOrderNumber = await getLastOrderNumber()
    res.status(200).json(lastOrderNumber)
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMap: Record<string, number> = {
        FAILED_TO_FETCH_LAST_ORDER_NUMBER: 500,
        UNKNOWN_ERROR: 500
      }
      const statusCode = errorMap[error.message] || 500
      return handleHttp(res, error.message, statusCode, error)
    }

    handleHttp(res, 'Internal Server Error', 500, error)
  }
}

const addItems = async (req: Request, res: Response) => {
  try {
    const orderData = plainToInstance(InsertOrderDTO, req.body)

    // Validate the order data
    const errors = await validate(orderData)

    // If validation errors exist, return a bad request response with error details
    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints
        }))
      })
    }
    const responseItem = await insertOrder(req.body)
    res.status(201).json(responseItem)
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMap: Record<string, number> = {
        ORDER_INSERT_ERROR: 500,
        ORDER_RETRIEVE_ERROR: 500,
        MEAL_FETCH_ERROR: 404,
        ORDER_ITEM_INSERT_ERROR: 500,
        ORDER_ITEM_DETAILS_INSERT_ERROR: 500,
        ORDER_TOTAL_UPDATE_ERROR: 500,
        PAYMENTS_INSERT_ERROR: 500,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[error.message] || 500
      return handleHttp(res, error.message, statusCode, error)
    }

    handleHttp(res, 'Internal Server Error', 500, error)
  }
}

const getItems = async (req: Request, res: Response) => {
  try {
    const orders = await getOrders()
    res.status(200).json(orders)
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMap: Record<string, number> = {
        FAILED_TO_FETCH_ORDERS: 500,
        NO_ORDER_FOUND: 404,
        FAILED_TO_FETCH_MEALS: 500,
        FAILED_TO_FETCH_ORDER_ITEM_DETAILS: 500,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[error.message] || 500
      return handleHttp(res, error.message, statusCode, error)
    }

    handleHttp(res, 'Internal Server Error', 500, error)
  }
}

const getItem = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id

    const order = await getOrderById(orderId)

    res.status(200).json(order)
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMap: Record<string, number> = {
        ORDER_NOT_FOUND: 404,
        FAILED_TO_FETCH_ORDER: 500,
        FAILED_TO_FETCH_MEALS: 500,
        FAILED_TO_FETCH_ORDER_ITEM_DETAILS: 500,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[error.message] || 500
      return handleHttp(res, error.message, statusCode, error)
    }

    handleHttp(res, 'Internal Server Error', 500, error)
  }
}

const updateItems = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id) // Convert to number
    const orderData = req.body

    if (isNaN(orderId)) {
      return handleHttp(res, 'Invalid order ID format.', 400)
    }

    // Transform the incoming request data to an instance of UpdateOrderDTO
    const updateData = plainToInstance(UpdateOrderDTO, orderData)

    // Validate the request data
    const errors = await validate(updateData)

    // If validation errors exist, return a 400 response with error details
    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints
        }))
      })
    }

    const responseItem = await updateOrder(orderId, orderData)

    res.status(200).json(responseItem)
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMap: Record<string, number> = {
        ORDER_NOT_FOUND: 404,
        ORDER_INSERT_ERROR: 500,
        ORDER_RETRIEVE_ERROR: 500,
        MEAL_FETCH_ERROR: 404,
        ORDER_ITEM_INSERT_ERROR: 500,
        ORDER_ITEM_DETAILS_INSERT_ERROR: 500,
        ORDER_TOTAL_UPDATE_ERROR: 500,
        PAYMENTS_INSERT_ERROR: 500,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[error.message] || 500
      return handleHttp(res, error.message, statusCode, error)
    }

    handleHttp(res, 'Internal Server Error', 500, error)
  }
}

const removeItems = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id)

    if (isNaN(orderId)) {
      return handleHttp(res, 'Invalid order ID format.', 400)
    }

    await deleteOrder(orderId)
    res
      .status(200)
      .json({ success: true, message: 'Order deleted successfully.' })
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMap: Record<string, number> = {
        ORDER_NOT_FOUND: 404,
        DELETE_ERROR: 500
      }

      const statusCode = errorMap[error.message] || 500
      return handleHttp(res, error.message, statusCode, error)
    }

    // Handles unexpected errors
    handleHttp(res, 'Internal Server Error', 500, error)
  }
}

const getReportItems = async (req: Request, res: Response) => {
  try {
    // Obtener el parámetro period de la query string (con valor por defecto 'day')
    const period = (req.query.period as 'day' | 'week' | 'month') || 'day'

    // Llamar a la función getSalesByPeriod pasando el period
    const reportsData = await getSalesByPeriod(period)

    // Devolver los datos con la respuesta
    res.status(200).json(reportsData)
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Mapear mensajes de error específicos a códigos de estado
      const errorMap: Record<string, number> = {
        FAILED_TO_FETCH_SALES: 500,
        UNKNOWN_ERROR: 500
      }

      // Obtener el código de estado correspondiente, por defecto 500
      const statusCode = errorMap[error.message] || 500

      // Enviar la respuesta de error utilizando handleHttp
      return handleHttp(res, error.message, statusCode, error)
    }

    // Manejar errores inesperados
    handleHttp(res, 'Internal Server Error', 500, error)
  }
}

export {
  addItems,
  getItems,
  getItem,
  removeItems,
  updateItems,
  getReportItems,
  getLastOrderNumberController,
  getNextOrderNumberController
}
