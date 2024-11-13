import { Meal } from '../interfaces/meal.interface'
import supabase from '../config/supabase'

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
  } catch (err) {
    console.error('Unexpected error:', err)
    throw new Error('Unexpected error')
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
  } catch (err) {
    console.error('Unexpected error:', err)
    throw new Error('Unexpected error')
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
  } catch (err) {
    console.error('Unexpected error:', err)
    throw new Error('Unexpected error')
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
  } catch (err) {
    console.error('Unexpected error:', err)
    throw new Error('Unexpected error')
  }
}

const deleteMealService = async (id: number) => {
  try {
    const { error } = await supabase.from('meals').delete().eq('id', id)

    if (error) {
      console.error('Error deleting meal:', error.message)
      throw new Error('Error deleting meal')
    }

    return true
  } catch (err) {
    console.error('Unexpected error:', err)
    throw new Error('Unexpected error')
  }
}

export {
  createMealService,
  getAllMealsService,
  getMealService,
  updateMealService,
  deleteMealService
}
