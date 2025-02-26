import { AppDataSource } from '../config/typeorm'
import { User } from '../entities/User.entity'
import { verified } from '../utils/bcrypt_handler'
import {
  generateToken,
  generateRereshToken,
  verifyRefreshToken
} from '../utils/jwt.handler'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { APIKey } from '../entities/ApiKey.entity'
import { LoginUserDTO } from '../dtos/auth/request.dto'

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
    const token = await generateToken(existingUser.email)
    const refreshToken = await generateRereshToken(existingUser.email)

    return {
      token,
      refreshToken,
      message: 'Sign in success'
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const createApiKey = async (userId: number): Promise<APIKey> => {
  const user = await userRepo.findOne({ where: { id: userId } })
  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  const newApiKey = new APIKey()
  newApiKey.key = uuidv4()
  newApiKey.user = user

  // Save the API key to the database
  await apiKeyRepo.save(newApiKey)

  return newApiKey
}

const refreshToken = async (refreshToken: string) => {
  const isValid = verifyRefreshToken(refreshToken)
  if (!isValid) {
    throw new Error('Invalid refresh token')
  }

  const { email } = isValid as { email: string }

  const newAccessToken = await generateToken(email)

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
