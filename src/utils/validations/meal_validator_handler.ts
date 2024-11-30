import Joi from 'joi'
import { Meal } from '../../interfaces/meal.interface'

//Define the joi schema for creating meals
const CreateMealSchema = Joi.object<Meal>({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category_id: Joi.number().required(),
  image_id: Joi.string().required(),
  image_url: Joi.string().required()
})

export const validateMeal = (meal: Meal) => {
  return CreateMealSchema.validate(meal)
}

//Define the joi schema for creating meals
const UpdateMealSchema = Joi.object<Meal>({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.number().optional(),
  category_id: Joi.number().optional(),
  image_id: Joi.string().optional(),
  image_url: Joi.string().optional()
})

export const validateMealUpdate = (meal: Meal) => {
  return UpdateMealSchema.validate(meal)
}
