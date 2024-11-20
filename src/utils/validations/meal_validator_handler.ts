import Joi from 'joi'
import { Meal } from '../../interfaces/meal.interface'

//Define the joi schema for creating meals
const CreateMealSchema = Joi.object<Meal>({
  name: Joi.string(),
  description: Joi.string(),
  price: Joi.number(),
  category_id: Joi.number()
})

export const validateMeal = (meal: Meal) => {
  return CreateMealSchema.validate(meal)
}
