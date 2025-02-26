import { AppDataSource } from '../config/typeorm'
import { User } from '../entities/User.entity'
import { Repository } from 'typeorm'
import { encrypt } from '../utils/bcrypt_handler'
import { Role } from '../entities/enums/Role.enum'

const userRepo: Repository<User> = AppDataSource.getRepository(User)

const insertUser = async ({ email, password, name, role }: Partial<User>) => {
  try {
    if (!password) {
      throw new Error('PASSWORD_REQUIRED')
    }
    const existingUser = await userRepo.findOne({ where: { email } })

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const passHash = await encrypt(password)

    const user = userRepo.create({
      email,
      password: passHash,
      name,
      role: role || Role.Cashier
    })

    // Insert the new user
    await userRepo.save(user)

    return { message: 'User inserted successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getUsers = async () => {
  try {
    const users = await userRepo.find()

    if (!users.length) {
      throw new Error('NO_USERS_FOUND')
    }

    return users
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getUserById = async (id: number) => {
  try {
    const user = await userRepo.findOne({
      where: { id },
      relations: ['apiKeys']
    })

    if (!user) {
      throw new Error('NO_USER_FOUND')
    }

    return user
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const updateUser = async (id: number, user: Partial<User>) => {
  try {
    const existingUser = await userRepo.findOne({ where: { id } })

    if (!existingUser) {
      throw new Error('USER_NOT_FOUND')
    }

    await userRepo.update(id, user)

    return { message: 'User updated successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const deleteUser = async (id: number) => {
  try {
    const existingUser = await userRepo.findOne({ where: { id } })

    if (!existingUser) {
      throw new Error('USER_NOT_FOUND')
    }

    // Delete the user
    await userRepo.remove(existingUser)

    return { message: 'User deleted successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

export { insertUser, getUsers, getUserById, updateUser, deleteUser }
