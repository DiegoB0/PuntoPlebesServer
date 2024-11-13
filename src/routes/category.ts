import { Router } from 'express'
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController
} from '../controllers/category'

const router = Router()

/**
 * http://localhost:5000/categories [POST]
 * Create a new category
 */
router.post('/', createCategoryController)

/**
 * http://localhost:5000/categories [GET]
 * Get all categories
 */
router.get('/', getAllCategoriesController)

/**
 * http://localhost:5000/categories/:id [GET]
 * Get a single category by ID
 */
router.get('/:id', getCategoryController)

/**
 * http://localhost:5000/categories/:id [PUT]
 * Update a category by ID
 */
router.put('/:id', updateCategoryController)

/**
 * http://localhost:5000/categories/:id [DELETE]
 * Delete a category by ID
 */
router.delete('/:id', deleteCategoryController)

export { router }
