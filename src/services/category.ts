import { Category } from '../interfaces/category.interface'
import supabase from '../config/supabase'

const createCategoryService = async (categoryData: Category) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])

    if (error) {
      console.error('Error creating category:', error.message)
      throw new Error('Error creating category')
    }

    if (!data) {
      throw new Error('NO_ITEM_FOUND')
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const getAllCategoriesService = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('*')

    if (error) {
      console.error('Error fetching categories:', error.message)
      throw new Error('Error fetching categories')
    }

    if (!data || data.length === 0) {
      throw new Error('NO_ITEM_FOUND')
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const getCategoryService = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching category:', error.message)
      throw new Error('Error fetching category')
    }

    if (!data || data.length === 0) {
      throw new Error('NO_ITEMS_FOUND')
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const updateCategoryService = async (id: number, categoryData: Category) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating category:', error.message)
      throw new Error('Error updating category')
    }

    if (!data || data.length === 0) {
      throw new Error('NO_ITEMS_FOUND')
    }

    const responseData = {
      data,
      message: 'Category updated successfully'
    }

    return responseData
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const deleteCategoryService = async (id: number) => {
  try {
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)

    if (fetchError) {
      throw new Error('FETCH_ERROR')
    }

    if (!existingCategory || existingCategory.length === 0) {
      throw new Error('ITEM_NOT_FOUND')
    }
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      console.error('Error deleting category:', error.message)
      throw new Error('Error deleting category')
    }

    return true // Return true if deletion was successful
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

export {
  createCategoryService,
  getAllCategoriesService,
  getCategoryService,
  updateCategoryService,
  deleteCategoryService
}
