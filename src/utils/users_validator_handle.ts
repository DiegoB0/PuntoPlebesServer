import Joi from 'joi'
import { User } from '../interfaces/user.interface'

// Define the Joi schema for the User interface
const userSchema = Joi.object<User>({
  name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'user').required()
})

// Validation function
export const validateUser = (user: User) => {
  return userSchema.validate(user)
}
