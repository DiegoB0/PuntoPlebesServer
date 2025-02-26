import { Request, Response } from 'express'
import { loginUser, createApiKey, refreshToken } from '../services/auth'
import { handleHttp } from '../utils/error_handler'
import { LoginUserDTO } from '../dtos/auth/request.dto'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

const loginController = async (data: any, res: Response) => {
  try {
    const loginData = plainToInstance(LoginUserDTO, data)

    // Validate the data
    const errors = await validate(loginData)
    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }
    const responseLogin = await loginUser(data)

    res.status(201).json(responseLogin)
  } catch (e: any) {
    if (e instanceof Error) {
      const errorMap: Record<string, number> = {
        USER_NOT_FOUND: 409,
        INVALID_EMAIL: 400,
        INCORRECT_PASSWORD: 500,
        UNKNOWN_ERROR: 500
      }

      const statusCode = errorMap[e.message] || 500
      return handleHttp(res, e.message, statusCode, e)
    }

    handleHttp(res, 'Internal Server Error', 500, e)
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
    res.json({ accessToken: newAccessToken })
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
    const user = req.body.user

    if (!user) {
      return handleHttp(res, 'User not found', 404)
    }

    const apiKey = await createApiKey(user.id)

    return res.status(201).json({ apiKey: apiKey.key })
  } catch (e: any) {
    if (e instanceof Error) {
      const errorMap: Record<string, number> = {
        USER_NOT_FOUND: 404,
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
