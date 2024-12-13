import { Request, Response } from 'express'
import { loginUser, registerUser } from '../services/auth'
import { generateToken, verifyRefreshToken } from '../utils/jwt.handler'
import {
  validateSignUpUser,
  validateSignInUser
} from '../utils/validations/user_validator_handler'
import { handleHttp } from '../utils/error_handler'

const registerController = async ({ body }: Request, res: Response) => {
  const { error } = validateSignUpUser(body)

  if (error) {
    console.log(error)
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: error.details.map((detail) => detail.message).join(', ')
    })
  }

  try {
    const responseUser = await registerUser(body)
    res.status(201).json(responseUser)
  } catch (e: any) {
    switch (e.message) {
      case 'USER_ALREADY_EXISTS':
        return handleHttp(res, 'User already exists with this email', 409)
      case 'INVALID_EMAIL':
        return handleHttp(res, 'Invalid email provided', 422)
      case 'INSERTION_ERROR':
        return handleHttp(res, 'Error inserting user', 500)
      default:
        return handleHttp(res, 'An unexpected error occurred', 500)
    }
  }
}

const loginController = async ({ body }: Request, res: Response) => {
  console.log(body)
  const { error } = validateSignInUser(body)

  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: error.details.map((detail) => detail.message).join(', ')
    })
  }

  try {
    const responseLogin = await loginUser(body)
    res.status(201).json(responseLogin)
  } catch (e: any) {
    switch (e.message) {
      case 'USER_NOT_FOUND':
        return handleHttp(res, 'No user with this email', 409)
      case 'INVALID_EMAIL':
        return handleHttp(res, 'Invalid email provided', 400)
      case 'INCORRECT_PASSWORD':
        return handleHttp(res, 'Incorrect password provided', 500)
      default:
        return handleHttp(res, 'An unexpected error occurred', 500)
    }
  }
}

const refreshTokenController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return handleHttp(res, 'Refresh token is missing', 401)
  }

  const isValid = verifyRefreshToken(refreshToken)
  if (!isValid) {
    return handleHttp(res, 'Invalid refresh token', 403)
  }

  // Extract the user ID from the refresh token payload
  const { email } = isValid as { email: string }
  const newAccessToken = await generateToken(email)

  res.json({ accessToken: newAccessToken })
}

export { registerController, loginController, refreshTokenController }
