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

    return data
  } catch (err) {
    console.error('Unexpected error:', err)
    throw new Error('Unexpected error')
  }
}

const getAllCategoriesService = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('*')

    if (error) {
      console.error('Error fetching categories:', error.message)
      throw new Error('Error fetching categories')
    }

    return data
  } catch (err) {
    console.error('Unexpected error:', err)
    throw new Error('Unexpected error')
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

    return data
  } catch (err) {
    console.error('Unexpected error:', err)
    throw new Error('Unexpected error')
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

    const responseData = {
      data,
      message: 'Category updated successfully'
    }

    return responseData
  } catch (err) {
    console.error('Unexpected error:', err)
    throw new Error('Unexpected error')
  }
}

const deleteCategoryService = async (id: number) => {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      console.error('Error deleting category:', error.message)
      throw new Error('Error deleting category')
    }

    return true // Return true if deletion was successful
  } catch (err) {
    console.error('Unexpected error:', err)
    throw new Error('Unexpected error')
  }
}

export {
  createCategoryService,
  getAllCategoriesService,
  getCategoryService,
  updateCategoryService,
  deleteCategoryService
}
