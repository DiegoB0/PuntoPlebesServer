import { Request, Response } from 'express'
import {
  insertCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} from '../services/category'
import { handleHttp } from '../utils/error_handler'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import {
  InsertCategoryDTO,
  UpdateCategoryDTO
} from '../dtos/category/request.dto'

const addItems = async ({ body }: Request, res: Response) => {
  try {
    const newCategory = plainToInstance(InsertCategoryDTO, body)

    // Validate the data
    const errors = await validate(newCategory)
    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    const createdCategory = await insertCategory(body)
    res.status(201).json(createdCategory)
  } catch (e: any) {
    if (e instanceof Error) {
      const errorMap: Record<string, number> = {
        CREATE_CATEGORY_ERROR: 500,
        NO_ITEM_FOUND: 404,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[e.message] || 500
      return handleHttp(res, e.message, statusCode, e)
    }

    handleHttp(res, 'Internal Server Error', 500, e)
  }
}

const getItems = async (req: Request, res: Response) => {
  try {
    const categories = await getCategories()
    res.status(200).json(categories)
  } catch (err: any) {
    if (err instanceof Error) {
      const errorMap: Record<string, number> = {
        FETCH_CATEGORIES_ERROR: 500,
        NO_ITEM_FOUND: 404,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[err.message] || 500
      return handleHttp(res, err.message, statusCode, err)
    }

    handleHttp(res, 'Internal Server Error', 500, err)
  }
}

const getItem = async ({ params }: Request, res: Response) => {
  try {
    const category = await getCategory(Number(params.id))
    res.status(200).json(category)
  } catch (err: any) {
    if (err instanceof Error) {
      const errorMap: Record<string, number> = {
        FETCH_CATEGORY_ERROR: 500,
        CATEGORY_NOT_FOUND: 404,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[err.message] || 500
      return handleHttp(res, err.message, statusCode, err)
    }

    handleHttp(res, 'Internal Server Error', 500, err)
  }
}

const updateItems = async ({ params, body }: Request, res: Response) => {
  try {
    const updatedCategoryData = plainToInstance(UpdateCategoryDTO, body)

    // Validate the data
    const errors = await validate(updatedCategoryData)
    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    const updatedCategory = await updateCategory(Number(params.id), body)
    res.status(200).json(updatedCategory)
  } catch (err: any) {
    if (err instanceof Error) {
      const errorMap: Record<string, number> = {
        UPDATE_CATEGORY_ERROR: 500,
        CATEGORY_NOT_FOUND: 404,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[err.message] || 500
      return handleHttp(res, err.message, statusCode, err)
    }

    handleHttp(res, 'Internal Server Error', 500, err)
  }
}

const removeItems = async (req: Request, res: Response) => {
  try {
    const itemId = Number(req.params.id)
    const result = await deleteCategory(itemId)

    if (!result)
      return res
        .status(404)
        .json({ error: 'CATEGORY_NOT_FOUND', message: 'Category not found' })

    res.status(200).json({ message: 'Category deleted successfully' })
  } catch (err: any) {
    if (err instanceof Error) {
      const errorMap: Record<string, number> = {
        FETCH_ERROR: 500,
        CATEGORY_NOT_FOUND: 404,
        DELETE_CATEGORY_ERROR: 500,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[err.message] || 500
      return res.status(statusCode).json({
        error: err.message,
        message: `Error processing request: ${err.message}`
      })
    }

    return handleHttp(res, 'Internal Server Error', 500, err)
  }
}

export { addItems, getItems, getItem, updateItems, removeItems }
