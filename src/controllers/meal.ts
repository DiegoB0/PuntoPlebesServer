import { Request, Response } from 'express'
import {
  createMealService,
  getAllMealsService,
  getMealService,
  updateMealService,
  deleteMealService
} from '../services/meal'
import { handleHttp } from '../utils/error_handler'
import { uploadImage } from '../utils/cloudinary'
import fs from 'fs-extra'
import {
  validateMeal,
  validateMealUpdate
} from '../utils/validations/meal_validator_handler'

const createMealController = async (req: Request, res: Response) => {
  try {
    let image_id = ''
    let image_url = ''

    // Check if an image is uploaded
    if (req.files?.image) {
      if (!Array.isArray(req.files.image)) {
        const result = await uploadImage(req.files.image.tempFilePath)
        image_id = result.public_id
        image_url = result.secure_url
        await fs.unlink(req.files.image.tempFilePath)
      } else {
        return handleHttp(res, 'Multiple images are not supported', 400)
      }
    }

    const mealData = {
      ...req.body,
      ...(image_id && image_url && { image_id, image_url })
    }

    const { error } = validateMeal(mealData)
    if (error) {
      return handleHttp(res, error.details[0].message, 400)
    }

    const newMeal = await createMealService(mealData)
    res.status(201).json(newMeal)
  } catch (err: any) {
    switch (err.message) {
      case 'ERROR_INSERT_MEAL':
        return handleHttp(res, 'Error inserting meal', 500)
      case 'ERROR_FETCH_MEAL':
        return handleHttp(res, 'Failed to retrieve inserted meal', 500)
      case 'UNKNOWN_ERROR':
        return handleHttp(res, 'An unexpected error occurred', 500)
      default:
        return handleHttp(res, 'Internal server error', 500)
    }
  }
}

const getAllMealsController = async (req: Request, res: Response) => {
  try {
    const meals = await getAllMealsService()
    res.status(200).json(meals)
  } catch (err: any) {
    switch (err.message) {
      case 'ERROR_FETCH_MEALS':
        return handleHttp(res, 'Error fetching meals', 500)
      case 'NO_MEALS_FOUND':
        return handleHttp(res, 'No meals found', 404)
      case 'UNKNOWN_ERROR':
        return handleHttp(res, 'An unexpected error occurred', 500)
      default:
        return handleHttp(res, 'Internal server error', 500)
    }
  }
}

const getMealController = async ({ params }: Request, res: Response) => {
  try {
    const meal = await getMealService(Number(params.id))
    res.status(200).json(meal)
  } catch (err: any) {
    switch (err.message) {
      case 'ERROR_FETCH_MEAL':
        return handleHttp(res, 'Error fetching meal', 500)
      case 'MEAL_NOT_FOUND':
        return handleHttp(res, 'Meal not found', 404)
      case 'UNKNOWN_ERROR':
        return handleHttp(res, 'An unexpected error occurred', 500)
      default:
        return handleHttp(res, 'Internal server error', 500)
    }
  }
}

const updateMealController = async (req: Request, res: Response) => {
  try {
    let mealData = req.body
    const itemId = req.params.id

    // Check if an image is uploaded
    if (req.files?.image) {
      // Handle single image upload
      if (!Array.isArray(req.files.image)) {
        const result = await uploadImage(req.files.image.tempFilePath)
        const image_id = result.public_id
        const image_url = result.secure_url

        mealData = {
          ...req.body,
          ...(image_id && image_url && { image_id, image_url })
        }

        await fs.unlink(req.files.image.tempFilePath)
      } else {
        return handleHttp(res, 'Multiple images is not supported')
      }
    } else {
      console.log('No image uploaded, proceeding without image.')
    }

    const { error } = validateMealUpdate(mealData)
    if (error) {
      return handleHttp(res, error.details[0].message, 400)
    }

    const updatedMeal = await updateMealService(itemId, mealData)
    res.status(200).json(updatedMeal)
  } catch (err: any) {
    switch (err.message) {
      case 'FETCH_ERROR':
        return handleHttp(res, 'Failed to fetch meals', 500)
      case 'ITEM_NOT_FOUND':
        return handleHttp(res, 'No meal found', 500)
      case 'UPDATE_MEAL_ERROR':
        return handleHttp(res, 'Error updating meal', 500)
      case 'UNKNOWN_ERROR':
        return handleHttp(res, 'An unexpected error occur', 500)
      default:
        return handleHttp(res, 'Internal server error', 500)
    }
  }
}

const deleteMealController = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id

    const { message } = await deleteMealService(itemId)
    res.status(200).json(message)

  } catch (err: any) {
    switch (err.message) {
      case 'FETCH_ERROR':
        return handleHttp(res, 'Failed to fetch meal', 500)
      case 'ITEM_NOT_FOUND':
        return handleHttp(res, 'Meal not found', 404)
      case 'DELETE_MEAL_ERROR':
        return handleHttp(res, 'Error deleting meal', 500)
      case 'UNKNOWN_ERROR':
        return handleHttp(res, 'An unexpected error occurred', 500)
      default:
        return handleHttp(res, 'Internal server error', 500)
    }
  }
}

export {
  createMealController,
  getAllMealsController,
  getMealController,
  updateMealController,
  deleteMealController
}
