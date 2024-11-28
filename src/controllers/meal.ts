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
import { validateMeal } from '../utils/validations/meal_validator_handler'

const createMealController = async (req: Request, res: Response) => {
  try {
    let image_id = ''
    let image_url = ''

    // Check if an image is uploaded
    if (req.files?.image) {
      // Handle single image upload
      if (!Array.isArray(req.files.image)) {
        const result = await uploadImage(req.files.image.tempFilePath)
        console.log(result)
        image_id = result.public_id
        image_url = result.secure_url

        await fs.unlink(req.files.image.tempFilePath)
      } else {
        console.log('I must be stupid sending a bunch of images to one meal')
      }
    } else {
      console.log('No image uploaded, proceeding without image.')
    }

    const mealData = {
      ...req.body,
      ...(image_id && image_url && { image_id, image_url })
    }

    const { error } = validateMeal(mealData)
    if (error) {
      return handleHttp(res, error.details[0].message, 400)
    }

    // Call the service to create the meal
    const newMeal = await createMealService(mealData)
    res.status(201).json(newMeal)
  } catch (err) {
    console.error('Error creating meal:', err)
    return handleHttp(res, 'Failed to create meal', 500)
  }
}

const getAllMealsController = async (req: Request, res: Response) => {
  try {
    const meals = await getAllMealsService()
    res.status(200).json(meals)
  } catch (err) {
    console.error('Error fetching meals:', err)
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch meals'
    })
  }
}

const getMealController = async ({ params }: Request, res: Response) => {
  try {
    const meal = await getMealService(Number(params.id))
    if (!meal)
      return res
        .status(404)
        .json({ error: 'MEAL_NOT_FOUND', message: 'Meal not found' })
    res.status(200).json(meal)
  } catch (err) {
    console.error('Error fetching meal:', err)
    res
      .status(500)
      .json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch meal' })
  }
}

const updateMealController = async (
  { params, body }: Request,
  res: Response
) => {
  try {
    const updatedMeal = await updateMealService(Number(params.id), body)
    if (!updatedMeal)
      return res
        .status(404)
        .json({ error: 'MEAL_NOT_FOUND', message: 'Meal not found' })
    res.status(200).json(updatedMeal)
  } catch (err) {
    console.error('Error updating meal:', err)
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update meal'
    })
  }
}

const deleteMealController = async ({ params }: Request, res: Response) => {
  try {
    const result = await deleteMealService(Number(params.id))
    if (!result)
      return res
        .status(404)
        .json({ error: 'MEAL_NOT_FOUND', message: 'Meal not found' })
    res.status(200).json({ message: 'Meal deleted successfully' })
  } catch (err) {
    console.error('Error deleting meal:', err)
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete meal'
    })
  }
}

export {
  createMealController,
  getAllMealsController,
  getMealController,
  updateMealController,
  deleteMealController
}
