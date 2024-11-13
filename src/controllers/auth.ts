import { Request, Response } from 'express'
import { loginUser, registerUser } from '../services/auth'
import { generateToken, verifyRefreshToken } from '../utils/jwt.handler'
import {
  validateSignUpUser,
  validateSignInUser
} from '../utils/user_validator_handler'

const registerController = async ({ body }: Request, res: Response) => {
  const { error } = validateSignUpUser(body)

  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: error.details.map((detail) => detail.message).join(', ')
    })
  }

  try {
    const responseUser = await registerUser(body)
    res.status(201).json(responseUser)
  } catch (err) {
    console.error('Error during registration:', err)
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to register user'
    })
  }
}

const loginController = async ({ body }: Request, res: Response) => {
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
  } catch (err) {
    console.error('Error during login:', err)
    res
      .status(500)
      .json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to login user' })
  }
}

const refreshTokenController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res
      .status(401)
      .json({ error: 'NO_REFRESH_TOKEN', message: 'Refresh token is missing' })
  }

  const isValid = verifyRefreshToken(refreshToken)
  if (!isValid) {
    return res.status(401).json({
      error: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid refresh token'
    })
  }

  // Extract the user ID from the refresh token payload
  const { email } = isValid as { email: string }
  const newAccessToken = await generateToken(email)

  res.json({ accessToken: newAccessToken })
}

export { registerController, loginController, refreshTokenController }
