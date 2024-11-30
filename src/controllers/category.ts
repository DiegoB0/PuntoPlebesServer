import { Request, Response } from 'express'
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryService,
  updateCategoryService,
  deleteCategoryService
} from '../services/category'
import { handleHttp } from '../utils/error_handler'

const createCategoryController = async ({ body }: Request, res: Response) => {
  try {
    const newCategory = await createCategoryService(body)
    res.status(201).json(newCategory)
  } catch (e: any) {
    switch (e.message) {
      case 'CREATE_CATEGORY_ERROR':
        return handleHttp(res, 'Error creating category', 500)
      case 'NO_ITEM_FOUND':
        return handleHttp(res, 'No category found', 404)
      case 'UNKNOWN_ERROR':
        return handleHttp(res, 'An unexpected error occurred', 500)
      default:
        return handleHttp(res, 'Internal server error', 500)
    }
  }
}

const getAllCategoriesController = async (req: Request, res: Response) => {
  try {
    const categories = await getAllCategoriesService()
    res.status(200).json(categories)
  } catch (err: any) {
    switch (err.message) {
      case 'FETCH_CATEGORIES_ERROR':
        return handleHttp(res, 'Error fetching categories', 500)
      case 'NO_ITEM_FOUND':
        return handleHttp(res, 'No categories found', 404)
      case 'UNKNOWN_ERROR':
        return handleHttp(res, 'An unexpected error occurred', 500)
      default:
        return handleHttp(res, 'Internal server error', 500)
    }
  }
}

const getCategoryController = async ({ params }: Request, res: Response) => {
  try {
    const category = await getCategoryService(Number(params.id))
    res.status(200).json(category)
  } catch (err: any) {
    switch (err.message) {
      case 'FETCH_CATEGORY_ERROR':
        return handleHttp(res, 'Error fetching category', 500)
      case 'CATEGORY_NOT_FOUND':
        return handleHttp(res, 'Category not found', 404)
      case 'UNKNOWN_ERROR':
        return handleHttp(res, 'An unexpected error occurred', 500)
      default:
        return handleHttp(res, 'Internal server error', 500)
    }
  }
}

const updateCategoryController = async (
  { params, body }: Request,
  res: Response
) => {
  try {
    const updatedCategory = await updateCategoryService(Number(params.id), body)

    res.status(200).json(updatedCategory)
  } catch (err: any) {
    switch (err.message) {
      case 'UPDATE_CATEGORY_ERROR':
        return handleHttp(res, 'Error updating category', 500)
      case 'CATEGORY_NOT_FOUND':
        return handleHttp(res, 'Category not found', 404)
      case 'UNKNOWN_ERROR':
        return handleHttp(res, 'An unexpected error occurred', 500)
      default:
        return handleHttp(res, 'Internal server error', 500)
    }
  }
}

const deleteCategoryController = async ({ params }: Request, res: Response) => {
  try {
    const result = await deleteCategoryService(Number(params.id))

    if (!result)
      return res
        .status(404)
        .json({ error: 'CATEGORY_NOT_FOUND', message: 'Category not found' })

    res.status(200).json({ message: 'Category deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting category:', err)
    switch (err.message) {
      case 'FETCH_ERROR':
        return res.status(500).json({
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching category'
        })
      case 'CATEGORY_NOT_FOUND':
        return res.status(404).json({
          error: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        })
      case 'DELETE_CATEGORY_ERROR':
        return res.status(500).json({
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Error deleting category'
        })
      case 'UNKNOWN_ERROR':
      default:
        return res.status(500).json({
          error: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        })
    }
  }
}

export {
  createCategoryController,
  getAllCategoriesController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController
}
