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
  } catch (err) {
    console.error('Error creating category:', err)
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create category'
    })
  }
}

const getAllCategoriesController = async (req: Request, res: Response) => {
  try {
    const categories = await getAllCategoriesService()
    res.status(200).json(categories)
  } catch (err) {
    console.error('Error fetching categories:', err)
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch categories'
    })
  }
}

const getCategoryController = async ({ params }: Request, res: Response) => {
  try {
    const category = await getCategoryService(Number(params.id))
    if (!category)
      return res
        .status(404)
        .json({ error: 'CATEGORY_NOT_FOUND', message: 'Category not found' })
    res.status(200).json(category)
  } catch (err) {
    console.error('Error fetching category:', err)
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch category'
    })
  }
}

const updateCategoryController = async (
  { params, body }: Request,
  res: Response
) => {
  try {
    const updatedCategory = await updateCategoryService(Number(params.id), body)
    if (!updatedCategory)
      return res
        .status(404)
        .json({ error: 'CATEGORY_NOT_FOUND', message: 'Category not found' })
    res.status(200).json(updatedCategory)
  } catch (err) {
    console.error('Error updating category:', err)
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update category'
    })
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
  } catch (err) {
    console.error('Error deleting category:', err)
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete category'
    })
  }
}

export {
  createCategoryController,
  getAllCategoriesController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController
}
