import Joi from 'joi'
import { User } from '../interfaces/user.interface'

// Define the Joi schema for creating users
const CreateUserSchema = Joi.object<User>({
  name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'user').required()
})

// Validation function to create users
export const validateCreateUser = (user: User) => {
  return CreateUserSchema.validate(user)
}

// Define the Joi schema for updating users
const UpdateUserSchema = Joi.object<User>({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().optional()
})

// Validation function
export const validateUpdateUser = (user: User) => {
  return UpdateUserSchema.validate(user)
}
