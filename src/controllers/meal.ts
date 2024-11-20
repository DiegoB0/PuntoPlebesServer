import { Request, Response } from 'express'
import {
  createMealService,
  getAllMealsService,
  getMealService,
  updateMealService,
  deleteMealService
} from '../services/meal'
import { handleHttp } from '../utils/error_handler'

const createMealController = async ({ body }: Request, res: Response) => {
  try {
    const newMeal = await createMealService(body)
    res.status(201).json(newMeal)
  } catch (err) {
    console.error('Error creating meal:', err)
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create meal'
    })
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
