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
      throw new Error('ERROR_INSERT_MEAL')
    }

    if (!data || data.length === 0) {
      throw new Error('ERROR_FETCH_MEAL')
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
      throw new Error('ERROR_FETCH_MEALS')
    }

    if (!data) {
      throw new Error('NO_MEALS_FOUND')
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
      throw new Error('ERROR_FETCH_MEAL')
    }

    if (!data) {
      throw new Error('MEAL_NOT_FOUND')
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

const updateMealService = async (id: string, mealData: Meal) => {
  try {
    const { data: existingMeal, error: fetchError } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)

    if (fetchError) {
      console.log('Some error related to fetching')
      throw new Error('FETCH_ERROR')
    }

    if (!existingMeal || existingMeal.length === 0) {
      console.log('Didnt find anything apparently')
      throw new Error('ITEM_NOT_FOUND')
    }

    const meal = (existingMeal as any)[0]

    if (meal.image_id) {
      const imageId = meal.image_id
      await deleteImage(imageId)
    }

    const { data, error } = await supabase
      .from('meals')
      .update(mealData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating meal:', error.message)
      throw new Error('UPDATE_MEAL_ERROR')
    }

    if (!data || data.length === 0) {
      console.log('It didnt return any data')
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

const deleteMealService = async (id: string) => {
  try {
    const { data: existingMeal, error: fetchError } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)

    if (fetchError) throw new Error('FETCH_ERROR')

    if (!existingMeal || existingMeal.length === 0)
      throw new Error('ITEM_NOT_FOUND')

    const meal = (existingMeal as any)[0]

    if (meal.image_id) {
      const imageId = meal.image_id
      await deleteImage(imageId)
    }

    const { error } = await supabase.from('meals').delete().eq('id', id)

    if (error) throw new Error('DELETE_MEAL_ERROR')

    return { success: true, message: 'Meal deleted successfully' }
  } catch (error) {
    if (error instanceof Error) throw error
    else throw new Error('UNKNOWN_ERROR')
  }
}

export {
  createMealService,
  getAllMealsService,
  getMealService,
  updateMealService,
  deleteMealService
}
