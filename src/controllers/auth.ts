import { Request, Response } from 'express'
import { loginUser, createApiKey, refreshToken } from '../services/auth'
import { handleHttp } from '../utils/error_handler'
import { LoginUserDTO } from '../dtos/auth/request.dto'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { RequestWithUser } from '../middlewares/sessions'

const loginController = async (req: Request, res: Response) => {
  try {
    const loginData = plainToInstance(LoginUserDTO, req.body)

    // Validate the data
    const errors = await validate(loginData)
    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    // Call loginUser service
    const responseLogin = await loginUser(req.body)

    // Return successful response
    return res.status(200).json(responseLogin) // Using 200 OK for login success
  } catch (e: any) {
    if (e instanceof Error) {
      // Error handling based on custom error messages
      const errorMap: Record<string, { message: string; statusCode: number }> =
        {
          USER_NOT_FOUND: { message: 'User not found', statusCode: 404 },
          INVALID_EMAIL: { message: 'Invalid email format', statusCode: 400 },
          INCORRECT_PASSWORD: {
            message: 'Incorrect password',
            statusCode: 401
          },
          UNKNOWN_ERROR: { message: 'Internal server error', statusCode: 500 }
        }

      const error = errorMap[e.message] || {
        message: 'Internal server error',
        statusCode: 500
      }

      // Return the mapped error response
      return res.status(error.statusCode).json({ message: error.message })
    }

    // Catch all for unexpected errors
    return res.status(500).json({ message: 'Internal server error', error: e })
  }
}

const refreshTokenController = async (req: any, res: any) => {
  try {
    const { refreshTokenKey } = req.body

    if (!refreshTokenKey) {
      return handleHttp(res, 'Refresh token is missing', 401)
    }

    const newAccessToken = await refreshToken(refreshTokenKey)

    // Return the new access token
    res.json({ token: newAccessToken })
  } catch (error) {
    if (error instanceof Error) {
      const errorMap: Record<string, number> = {
        INVALID_REFRESH_TOKEN: 401,
        REFRESH_TOKEN_NOT_FOUND: 404,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[error.message] || 500
      return handleHttp(res, error.message, statusCode, error)
    }

    console.log(error)
    return handleHttp(res, 'Error occurred while refreshing token', 500)
  }
}

const createApiKeyController = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as RequestWithUser).userEmail
    if (!userEmail) {
      return res.status(400).json({
        message: 'Not user associated with this operation'
      })
    }

    const loginData = plainToInstance(LoginUserDTO, req.body)

    // Validate request data
    const errors = await validate(loginData)
    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    const apiKey = await createApiKey(loginData, userEmail)

    return res.status(201).json({ apiKey: apiKey.key })
  } catch (e: any) {
    if (e instanceof Error) {
      const errorMap: Record<string, number> = {
        NOT_VALID_ROLE: 401,
        USER_ALREADY_CREATED_ONE: 409,
        USER_NOT_FOUND: 404,
        INCORRECT_PASSWORD: 401,
        API_KEY_GENERATION_ERROR: 500,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[e.message] || 500
      return handleHttp(res, e.message, statusCode, e)
    }

    console.log(e)
    return handleHttp(res, 'Error generating API Key', 500)
  }
}

export { loginController, refreshTokenController, createApiKeyController }
