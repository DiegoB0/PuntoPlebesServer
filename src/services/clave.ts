import { AppDataSource } from '../config/typeorm'
import { Repository } from 'typeorm'
import { Clave } from '../entities/Claves.entity'
import { TipoClave } from '../entities/enums/Clave.enum'
import { createLog } from './log'
import { User } from '../entities/User.entity'
import { ActionType } from '../entities/enums/ActionType.enum'

const claveRepo: Repository<Clave> = AppDataSource.getRepository(Clave)
const userRepo: Repository<User> = AppDataSource.getRepository(User)

const insertClave = async (
  {
    palabra,
    clave
  }: {
    palabra: string
    clave: string
  },
  userEmail: string
) => {
  try {
    const newClave = claveRepo.create({
      palabra,
      clave,
      tipo_clave: TipoClave.Extra
    })

    await claveRepo.save(newClave)

    const actionUser = await userRepo.findOne({ where: { email: userEmail } })

    if (!actionUser) {
      throw new Error('USER_NOT_FOUND')
    }

    //Logs
    createLog(actionUser, `Creo una nueva clave`, ActionType.Create)

    return { message: 'Plain Clave created successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getClaves = async () => {
  try {
    const claves = await claveRepo.find()
    if (!claves.length) throw new Error('NO_CLAVES_FOUND')

    return claves
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getClaveById = async (id: number) => {
  try {
    const clave = await claveRepo.findOne({ where: { id } })
    if (!clave) throw new Error('CLAVE_NOT_FOUND')

    return clave
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const updateClave = async (
  id: number,
  updateData: Partial<Clave>,
  userEmail: string
) => {
  try {
    const clave = await claveRepo.findOne({ where: { id } })
    if (!clave) throw new Error('CLAVE_NOT_FOUND')

    claveRepo.merge(clave, updateData)
    await claveRepo.save(clave)

    const actionUser = await userRepo.findOne({ where: { email: userEmail } })

    if (!actionUser) {
      throw new Error('USER_NOT_FOUND')
    }

    //Logs
    createLog(
      actionUser,
      `Actualizo la clave con el ID: ${id}`,
      ActionType.Update
    )

    return { message: 'Clave updated successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const deleteClave = async (id: number, userEmail: string) => {
  try {
    const clave = await claveRepo.findOne({ where: { id } })
    if (!clave) throw new Error('CLAVE_NOT_FOUND')

    await claveRepo.remove(clave)

    const actionUser = await userRepo.findOne({ where: { email: userEmail } })

    if (!actionUser) {
      throw new Error('USER_NOT_FOUND')
    }

    //Logs
    createLog(
      actionUser,
      `Elimino la clave con el ID: ${id}`,
      ActionType.Delete
    )

    return { message: 'Clave deleted successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

export { insertClave, getClaves, getClaveById, updateClave, deleteClave }
