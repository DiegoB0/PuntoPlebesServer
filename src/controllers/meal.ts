import { Request, Response } from 'express'
import {
  insertMeal,
  getMeals,
  getMeal,
  updateMeal,
  deleteMeal
} from '../services/meal'
import { handleHttp } from '../utils/error_handler'
import { uploadImage } from '../utils/cloudinary'
import fs from 'fs-extra'
import { RequestWithUser } from '../middlewares/sessions'

const addItems = async (req: Request, res: Response) => {
  try {
    let mealData = req.body

    const userEmail = (req as RequestWithUser).userEmail
    if (!userEmail) {
      return res.status(400).json({
        message: 'Not user associated with this operation'
      })
    }

    if (mealData.isClaveApplied) {
      mealData.isClaveApplied =
        mealData.isClaveApplied.toString().toLowerCase() === 'true'
    }

    let image_id = ''
    let image_url = ''

    // Check if an image is uploaded
    if (req.files?.image) {
      if (!Array.isArray(req.files.image)) {
        const result = await uploadImage(req.files.image.tempFilePath)
        image_id = result.public_id
        image_url = result.secure_url

        // Extend mealData properly while keeping validation
        mealData = Object.assign(mealData, { image_id, image_url })

        await fs.unlink(req.files.image.tempFilePath)
      } else {
        return handleHttp(res, 'Multiple images are not supported', 400)
      }
    }

    const newMeal = await insertMeal(mealData, userEmail)
    res.status(201).json(newMeal)
  } catch (e: any) {
    if (e instanceof Error) {
      const errorMap: Record<string, number> = {
        CATEGORY_NOT_FOUND: 404,
        ERROR_INSERT_MEAL: 500,
        ERROR_FETCH_MEAL: 500,
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
    const meals = await getMeals()
    res.status(200).json(meals)
  } catch (e: any) {
    if (e instanceof Error) {
      const errorMap: Record<string, number> = {
        ERROR_FETCH_MEALS: 500,
        NO_MEALS_FOUND: 404,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[e.message] || 500
      return handleHttp(res, e.message, statusCode, e)
    }

    handleHttp(res, 'Internal Server Error', 500, e)
  }
}

const getItem = async ({ params }: Request, res: Response) => {
  try {
    const meal = await getMeal(Number(params.id))
    res.status(200).json(meal)
  } catch (e: any) {
    if (e instanceof Error) {
      const errorMap: Record<string, number> = {
        ERROR_FETCH_MEAL: 500,
        MEAL_NOT_FOUND: 404,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[e.message] || 500
      return handleHttp(res, e.message, statusCode, e)
    }

    handleHttp(res, 'Internal Server Error', 500, e)
  }
}

const updateItems = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as RequestWithUser).userEmail
    if (!userEmail) {
      return res.status(400).json({
        message: 'Not user associated with this operation'
      })
    }

    let mealData = req.body

    const itemId = Number(req.params.id)

    // Check if an image is uploaded
    if (req.files?.image) {
      if (!Array.isArray(req.files.image)) {
        const result = await uploadImage(req.files.image.tempFilePath)
        const image_id = result.public_id
        const image_url = result.secure_url

        // Keep the DTO structure and extend it properly
        mealData = Object.assign(mealData, { image_id, image_url })

        await fs.unlink(req.files.image.tempFilePath)
      } else {
        return handleHttp(res, 'Multiple images are not supported', 400)
      }
    }

    // Validate DTO

    const updatedMeal = await updateMeal(itemId, mealData, userEmail)
    res.status(200).json(updatedMeal)
  } catch (e: any) {
    if (e instanceof Error) {
      const errorMap: Record<string, number> = {
        ITEM_NOT_FOUND: 404,
        UPDATE_MEAL_ERROR: 500,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[e.message] || 500
      return handleHttp(res, e.message, statusCode, e)
    }

    handleHttp(res, 'Internal Server Error', 500, e)
  }
}

const removeItem = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as RequestWithUser).userEmail
    if (!userEmail) {
      return res.status(400).json({
        message: 'Not user associated with this operation'
      })
    }

    const itemId = Number(req.params.id)

    const { message } = await deleteMeal(itemId, userEmail)
    res.status(200).json(message)
  } catch (e: any) {
    if (e instanceof Error) {
      const errorMap: Record<string, number> = {
        ITEM_NOT_FOUND: 404,
        DELETE_MEAL_ERROR: 500,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[e.message] || 500
      return handleHttp(res, e.message, statusCode, e)
    }

    handleHttp(res, 'Internal Server Error', 500, e)
  }
}

export { addItems, getItems, getItem, updateItems, removeItem }
