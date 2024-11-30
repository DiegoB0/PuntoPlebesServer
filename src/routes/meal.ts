import { Router } from 'express'
import {
  createMealController,
  getAllMealsController,
  getMealController,
  updateMealController,
  deleteMealController
} from '../controllers/meal'

import fileUpload from 'express-fileupload'

const router = Router()

/**
 * http://localhost:5000/meals [POST]
 * Create a new meal
 */
router.post(
  '/',
  fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads'
  }),
  createMealController
)

/**
 * http://localhost:5000/meals [GET]
 * Get all meals
 */
router.get('/', getAllMealsController)

/**
 * http://localhost:5000/meals/:id [GET]
 * Get a single meal by ID
 */
router.get('/:id', getMealController)

/**
 * http://localhost:5000/meals/:id [PUT]
 * Update a meal by ID
 */
router.put(
  '/:id',
  fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads'
  }),
  updateMealController
)

/**
 * http://localhost:5000/meals/:id [DELETE]
 * Delete a meal by ID
 */
router.delete('/:id', deleteMealController)

export { router }
