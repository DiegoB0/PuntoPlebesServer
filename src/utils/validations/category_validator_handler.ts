import Joi from 'joi'
import { Category } from '../../interfaces/category.interface'

//Define the joi schema for creating categories
const CreateMealSchema = Joi.object<Category>({
  category_name: Joi.string()
})

export const validateMeal = (category: Category) => {
  return CreateMealSchema.validate(category)
}
