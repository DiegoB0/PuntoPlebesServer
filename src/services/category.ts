import { AppDataSource } from '../config/typeorm'
import { Category } from '../entities/Categories.entity'
import { Repository } from 'typeorm'
import { Menu } from '../entities/enums/Menu.enum'

const categoryRepo: Repository<Category> = AppDataSource.getRepository(Category)

const insertCategory = async (categoryData: Category) => {
  try {
    if (!Object.values(Menu).includes(categoryData.menu_type as Menu)) {
      throw new Error('INVALID_MENU_TYPE')
    }
    // Create a new category instance
    const category = categoryRepo.create(categoryData)

    // Save the new category to the database
    const savedCategory = await categoryRepo.save(category)

    if (!savedCategory) {
      throw new Error('NO_ITEM_FOUND')
    }

    return savedCategory
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating category:', error.message)
      throw error
    } else {
      console.error('Unknown error:', error)
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const getCategories = async () => {
  try {
    // Fetch all categories from the database
    const categories = await categoryRepo.find()

    if (!categories || categories.length === 0) {
      throw new Error('NO_ITEM_FOUND')
    }

    return categories
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching categories:', error.message)
      throw error
    } else {
      console.error('Unknown error:', error)
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const getCategory = async (id: number) => {
  try {
    // Fetch the category by ID from the database
    const category = await categoryRepo.findOne({
      where: { id }
    })

    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND')
    }

    return category
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching category:', error.message)
      throw error
    } else {
      console.error('Unknown error:', error)
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const updateCategory = async (id: number, categoryData: Category) => {
  try {
    // Find the category by ID
    const category = await categoryRepo.findOne({
      where: { id }
    })

    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND')
    }

    // Update the category data
    await categoryRepo.update(id, categoryData)

    // Fetch the updated category
    const updatedCategory = await categoryRepo.findOne({
      where: { id }
    })

    const responseData = {
      data: updatedCategory,
      message: 'Category updated successfully'
    }

    return responseData
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating category:', error.message)
      throw error
    } else {
      console.error('Unknown error:', error)
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const deleteCategory = async (id: number) => {
  try {
    // Find the category by ID
    const category = await categoryRepo.findOne({
      where: { id }
    })

    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND')
    }

    // Delete the category
    await categoryRepo.delete(id)

    return true // Return true if deletion was successful
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting category:', error.message)
      throw error
    } else {
      console.error('Unknown error:', error)
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

export {
  insertCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
}
