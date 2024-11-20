import Joi from 'joi'
import { User } from '../../interfaces/user.interface'
import { Signup } from '../../interfaces/signup.interface'
import { Auth } from '../../interfaces/auth.interface'

//Define the joi schema for signing up users
const CreateSignUpSchema = Joi.object<Signup>({
  name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/)
    .min(3) // You can adjust the minimum length here
    .max(255) // Optional: Adjust the maximum length
    .required()
    .messages({
      'string.pattern.base': `"name" must contain only alphabetic characters (no numbers or special characters)`,
      'string.min': `"name" must have at least 3 characters`,
      'string.max': `"name" cannot have more than 255 characters`,
      'any.required': `"name" is required`
    }),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8) // Minimum password length of 8 characters
    .pattern(/(?=.*[a-z])/) // At least one lowercase letter
    .pattern(/(?=.*[A-Z])/) // At least one uppercase letter
    .pattern(/(?=.*\d)/) // At least one digit
    .pattern(/(?=.*[@$!%*?&])/) // At least one special character
    .required()
    .messages({
      'string.min': `"password" must have at least 8 characters`,
      'string.pattern.base': `"password" must contain at least one lowercase letter, one uppercase letter, one number, and one special character`,
      'any.required': `"password" is required`
    })
})

export const validateSignUpUser = (user: Signup) => {
  return CreateSignUpSchema.validate(user)
}

//Define the joi schema for signing in users
const CreateSignInSchema = Joi.object<Auth>({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

export const validateSignInUser = (user: Auth) => {
  return CreateSignInSchema.validate(user)
}

// Define the Joi schema for creating users
const CreateUserSchema = Joi.object<User>({
  name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/)
    .min(3) // You can adjust the minimum length here
    .max(255) // Optional: Adjust the maximum length
    .required()
    .messages({
      'string.pattern.base': `"name" must contain only alphabetic characters (no numbers or special characters)`,
      'string.min': `"name" must have at least 3 characters`,
      'string.max': `"name" cannot have more than 255 characters`,
      'any.required': `"name" is required`
    }),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8) // Minimum password length of 8 characters
    .pattern(/(?=.*[a-z])/) // At least one lowercase letter
    .pattern(/(?=.*[A-Z])/) // At least one uppercase letter
    .pattern(/(?=.*\d)/) // At least one digit
    .pattern(/(?=.*[@$!%*?&])/) // At least one special character
    .required()
    .messages({
      'string.min': `"password" must have at least 8 characters`,
      'string.pattern.base': `"password" must contain at least one lowercase letter, one uppercase letter, one number, and one special character`,
      'any.required': `"password" is required`
    }),
  role: Joi.string().valid('admin', 'user').required()
})

// Validation function to create users
export const validateCreateUser = (user: User) => {
  return CreateUserSchema.validate(user)
}

// Define the Joi schema for updating users
const UpdateUserSchema = Joi.object<User>({
  name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/)
    .min(3) // Minimum length 3 characters
    .max(255) // Optional: Adjust the maximum length
    .optional()
    .messages({
      'string.pattern.base': `"name" must contain only alphabetic characters (no numbers or special characters)`,
      'string.min': `"name" must have at least 3 characters`,
      'string.max': `"name" cannot have more than 255 characters`,
      'any.required': `"name" is required`
    }),
  email: Joi.string().email().optional(), // Email is optional for the update
  password: Joi.string()
    .min(8) // Minimum password length of 8 characters
    .pattern(/(?=.*[a-z])/) // At least one lowercase letter
    .pattern(/(?=.*[A-Z])/) // At least one uppercase letter
    .pattern(/(?=.*\d)/) // At least one digit
    .pattern(/(?=.*[@$!%*?&])/) // At least one special character
    .optional()
    .messages({
      'string.min': `"password" must have at least 8 characters`,
      'string.pattern.base': `"password" must contain at least one lowercase letter, one uppercase letter, one number, and one special character`,
      'any.required': `"password" is required`
    }),
  role: Joi.string().valid('admin', 'user').optional() // Role is optional for the update
})

// Validation function
export const validateUpdateUser = (user: User) => {
  return UpdateUserSchema.validate(user)
}
