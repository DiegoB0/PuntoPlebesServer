import { AppDataSource } from '../config/typeorm'
import { Meal } from '../entities/Meals.entity'
import { Clave } from '../entities/Claves.entity'
import { Category } from '../entities/Categories.entity'
import { deleteImage } from '../utils/cloudinary'
import { Repository } from 'typeorm'
import { TipoClave } from '../entities/enums/Clave.enum'
import { InsertMealDTO, UpdateMealDTO } from '../dtos/meal/request.dto'

// Repositories
const mealRepo: Repository<Meal> = AppDataSource.getRepository(Meal)
const categoryRepo: Repository<Category> = AppDataSource.getRepository(Category)
const claveRepo: Repository<Clave> = AppDataSource.getRepository(Clave)

const insertMeal = async (mealData: InsertMealDTO) => {
  try {
    console.log(mealData)
    // Check if category exists
    const category = await categoryRepo.findOne({
      where: { id: mealData.categoryId }
    })
    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND')
    }

    const newMeal = mealRepo.create({
      name: mealData.name,
      description: mealData.description,
      category: category,
      price: mealData.price,
      image_id: mealData.image_id,
      image_url: mealData.image_url,
      isClaveApplied: mealData.isClaveApplied
    })
    await mealRepo.save(newMeal)

    const newClave = claveRepo.create({
      palabra: mealData.palabra,
      clave: mealData.clave,
      tipo_clave: TipoClave.Comida,
      meal: newMeal
    })

    // 3. Save the Clave
    await claveRepo.save(newClave)
    newMeal.clave = newClave

    // Save meal with the associated clave
    await mealRepo.save(newMeal)

    return {
      meal: newMeal,
      clave: newClave
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating meal:', error.message)
      throw new Error('ERROR_INSERT_MEAL')
    } else {
      console.error('Unknown error during meal creation')
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const getMeals = async () => {
  try {
    const meals = await mealRepo.find({
      relations: ['category', 'clave'],
      order: { id: 'ASC' }
    })

    if (!meals || meals.length === 0) {
      throw new Error('NO_MEALS_FOUND')
    }

    return meals
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching meals:', error.message)
      throw new Error('ERROR_FETCH_MEALS')
    } else {
      console.error('Unknown error during meal fetch')
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const getMeal = async (id: number) => {
  try {
    const meal = await mealRepo.findOne({
      where: { id },
      relations: ['category', 'orderItems', 'clave']
    })

    if (!meal) {
      throw new Error('MEAL_NOT_FOUND')
    }

    return meal
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching meal:', error.message)
      throw new Error('ERROR_FETCH_MEAL')
    } else {
      console.error('Unknown error during meal fetch')
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const updateMeal = async (id: number, mealData: UpdateMealDTO) => {
  try {
    // Check if category exists
    const category = mealData.categoryId
      ? await categoryRepo.findOne({ where: { id: mealData.categoryId } })
      : null
    if (mealData.categoryId && !category) {
      throw new Error('CATEGORY_NOT_FOUND')
    }

    // Fetch existing meal with related 'category' and 'clave'
    const existingMeal = await mealRepo.findOne({
      where: { id },
      relations: ['category', 'clave']
    })

    if (!existingMeal) {
      throw new Error('ITEM_NOT_FOUND')
    }

    // If category is provided, update category reference
    if (mealData.categoryId) {
      existingMeal.category = category!
    }

    // If the meal has an image, handle its deletion or update
    if (mealData.image_id && existingMeal.image_id !== mealData.image_id) {
      if (existingMeal.image_id) {
        await deleteImage(existingMeal.image_id.toString()) // Delete old image if different
      }
      existingMeal.image_id = mealData.image_id
    }

    // If price or other fields are updated, apply the changes
    if (mealData.price) {
      existingMeal.price = mealData.price
    }
    if (mealData.name) {
      existingMeal.name = mealData.name
    }
    if (mealData.description) {
      existingMeal.description = mealData.description
    }
    if (mealData.image_url) {
      existingMeal.image_url = mealData.image_url
    }

    // Update isClaveApplied
    if (mealData.isClaveApplied !== undefined) {
      existingMeal.isClaveApplied = mealData.isClaveApplied // Update if passed
    }

    // Handle Clave
    let updatedClave = existingMeal.clave

    if (mealData.clave) {
      if (typeof mealData.clave === 'string') {
        // Check if Clave exists or create a new one
        let existingClave = await claveRepo.findOne({
          where: { clave: mealData.clave }
        })
        if (!existingClave) {
          existingClave = claveRepo.create({
            palabra: mealData.palabra, // Only set palabra if new clave is being created
            clave: mealData.clave,
            tipo_clave: TipoClave.Comida,
            meal: existingMeal
          })
          await claveRepo.save(existingClave)
        }
        updatedClave = existingClave
      } else {
        // If Clave is passed as an object, just assign it
        updatedClave = mealData.clave
      }
    }

    existingMeal.clave = updatedClave

    // Save the updated meal
    const updatedMeal = await mealRepo.save(existingMeal)

    return updatedMeal
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating meal:', error.message)
      throw new Error('UPDATE_MEAL_ERROR')
    } else {
      console.error('Unknown error during meal update')
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const deleteMeal = async (id: number) => {
  try {
    const existingMeal = await mealRepo.findOne({
      where: { id },
      relations: ['orderItems', 'clave']
    })

    if (!existingMeal) {
      throw new Error('ITEM_NOT_FOUND')
    }

    if (existingMeal.image_id) {
      await deleteImage(existingMeal.image_id.toString())
    }

    if (existingMeal.clave) {
      await claveRepo.delete(existingMeal.clave.id)
    }

    // Delete the meal itself
    await mealRepo.delete(id)

    return { success: true, message: 'Meal deleted successfully' }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting meal:', error.message)
      throw new Error('DELETE_MEAL_ERROR')
    } else {
      console.error('Unknown error during meal deletion')
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

export { insertMeal, getMeals, getMeal, updateMeal, deleteMeal }
