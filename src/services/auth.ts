import { AppDataSource } from '../config/typeorm'
import { User } from '../entities/User.entity'
import { verified } from '../utils/bcrypt_handler'
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwt.handler'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { APIKey } from '../entities/ApiKey.entity'
import { LoginUserDTO } from '../dtos/auth/request.dto'
import { createLog } from './log'
import { ActionType } from '../entities/enums/ActionType.enum'
import { Role } from '../entities/enums/Role.enum'

const apiKeyRepo: Repository<APIKey> = AppDataSource.getRepository(APIKey)
const userRepo: Repository<User> = AppDataSource.getRepository(User)

const loginUser = async (loginData: LoginUserDTO) => {
  try {
    // Find user by email
    const existingUser = await userRepo.findOne({
      where: { email: loginData.email }
    })

    if (!existingUser) {
      throw new Error('USER_NOT_FOUND')
    }

    // Check if passwords match
    const isCorrect = await verified(loginData.password, existingUser.password)
    if (!isCorrect) {
      throw new Error('INCORRECT_PASSWORD')
    }

    // Generate JWT tokens
    const token = await generateToken({
      email: existingUser.email,
      role: existingUser.role
    })
    const refreshToken = await generateRefreshToken(existingUser.email)

    const user = {
      user_email: existingUser.email,
      user_role: existingUser.role
    }

    // console.log(user)

    // Return success response with tokens
    return {
      user,
      token,
      refreshToken,
      message: 'Sign in success'
    }
  } catch (error) {
    // Ensure errors are thrown appropriately
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const createApiKey = async (
  loginData: LoginUserDTO,
  userEmail: string
): Promise<APIKey> => {
  // Find user by email
  const existingUser = await userRepo.findOne({
    where: { email: loginData.email },
    relations: ['apiKeys']
  })
  if (!existingUser) {
    throw new Error('USER_NOT_FOUND')
  }

  if (existingUser.apiKeys && existingUser.apiKeys.length > 0) {
    throw new Error('USER_ALREADY_CREATED_ONE')
  }

  if (existingUser.role !== Role.Admin) {
    throw new Error('NOT_VALID_ROLE')
  }

  // Verify password
  const isCorrect = await verified(loginData.password, existingUser.password)
  if (!isCorrect) {
    throw new Error('INCORRECT_PASSWORD')
  }

  // Generate new API key
  const newApiKey = new APIKey()
  newApiKey.key = uuidv4()
  newApiKey.user = existingUser

  // Save API key to database
  await apiKeyRepo.save(newApiKey)

  const actionUser = await userRepo.findOne({ where: { email: userEmail } })

  if (!actionUser) {
    throw new Error('USER_NOT_FOUND')
  }

  //Logs
  createLog(actionUser, `Creo una nueva API KEY`, ActionType.Create)

  return newApiKey
}

const refreshToken = async (refreshTokenKey: string) => {
  const isValid = verifyRefreshToken(refreshTokenKey)
  if (!isValid) {
    throw new Error('Invalid refresh token')
  }

  const { email, role } = isValid as { email: string; role: string }

  const newAccessToken = await generateToken({ email, role })

  return newAccessToken
}

const validateApiKey = async (apiKey: string): Promise<APIKey | null> => {
  try {
    const apiKeyRecord = await apiKeyRepo.findOne({ where: { key: apiKey } })

    if (!apiKeyRecord) {
      return null
    }

    return apiKeyRecord
  } catch (error) {
    console.log(error)
    throw new Error('Error validating API Key')
  }
}

export { loginUser, createApiKey, validateApiKey, refreshToken }
