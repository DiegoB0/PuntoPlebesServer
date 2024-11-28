import { Meal } from '../interfaces/meal.interface'
import supabase from '../config/supabase'
import { deleteImage } from '../utils/cloudinary'

const createMealService = async (mealData: Meal) => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .insert([mealData])
      .select()

    if (error) {
      console.error('Error creating meal:', error.message)
      throw new Error('Error creating meal')
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

const getAllMealsService = async () => {
  try {
    const { data, error } = await supabase.from('meals').select('*')

    if (error) {
      console.error('Error fetching meals:', error.message)
      throw new Error('Error fetching meals')
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

const getMealService = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching meal:', error.message)
      throw new Error('Error fetching meal')
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

const updateMealService = async (id: number, mealData: Meal) => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .update(mealData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating meal:', error.message)
      throw new Error('Error updating meal')
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

const deleteMealService = async (id: number) => {
  try {
    const { data: existingMeal, error: fetchError } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)

    if (fetchError) {
      throw new Error('FETCH_ERROR')
    }

    if (!existingMeal || existingMeal.length === 0) {
      throw new Error('ITEM_NOT_FOUND')
    }

    const imageId = (existingMeal as any)[0].image_id

    const result = await deleteImage(imageId)

    console.log(result)

    const { error } = await supabase.from('meals').delete().eq('id', id)

    if (error) {
      console.error('Error deleting meal:', error.message)
      throw new Error('Error deleting meal')
    }

    return true
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

export {
  createMealService,
  getAllMealsService,
  getMealService,
  updateMealService,
  deleteMealService
}
