import { AppDataSource } from '../config/typeorm'
import { In, Repository } from 'typeorm'
import { Modificador } from '../entities/Modificadores.entity'
import { Clave } from '../entities/Claves.entity'
import { TipoClave } from '../entities/enums/Clave.enum'
import { Category } from '../entities/Categories.entity'
import { createLog } from './log'
import { User } from '../entities/User.entity'
import { ActionType } from '../entities/enums/ActionType.enum'

const modificadorRepo: Repository<Modificador> =
  AppDataSource.getRepository(Modificador)
const claveRepo: Repository<Clave> = AppDataSource.getRepository(Clave)
const categoryRepo: Repository<Category> = AppDataSource.getRepository(Category)
const userRepo: Repository<User> = AppDataSource.getRepository(User)

const insertModifier = async (
  { name, description, claveData, hasPrice, price, categoryIds }: any,
  userEmail: string
) => {
  try {
    const clave = claveRepo.create({
      palabra: claveData.palabra,
      clave: claveData.clave,
      tipo_clave: TipoClave.Modificador
    })

    await claveRepo.save(clave)

    // Add categories
    const categories = await categoryRepo.find({
      where: {
        id: In(categoryIds)
      }
    })

    if (categories.length !== categoryIds.length) {
      throw new Error('One or more categories not found')
    }

    const modificador = modificadorRepo.create({
      name,
      description,
      clave,
      hasPrice,
      price,
      categories
    })

    await modificadorRepo.save(modificador)

    const actionUser = await userRepo.findOne({ where: { email: userEmail } })

    if (!actionUser) {
      throw new Error('USER_NOT_FOUND')
    }

    //Logs
    createLog(actionUser, 'Creo un nuevo modificador', ActionType.Create)

    return { message: 'Modificador created successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getModifiers = async () => {
  try {
    const modificadores = await modificadorRepo.find({
      relations: ['clave', 'categories']
    })
    if (!modificadores.length) throw new Error('NO_MODIFICADORES_FOUND')

    return modificadores
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getModifierById = async (id: number) => {
  try {
    const modificador = await modificadorRepo.findOne({
      where: { id },
      relations: ['clave', 'categories']
    })
    if (!modificador) throw new Error('MODIFICADOR_NOT_FOUND')

    return modificador
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const updateModifier = async (
  id: number,
  updateData: any,
  userEmail: string
) => {
  try {
    const modificador = await modificadorRepo.findOne({
      where: { id },
      relations: ['clave']
    })
    if (!modificador) throw new Error('MODIFICADOR_NOT_FOUND')

    modificadorRepo.merge(modificador, updateData)
    await modificadorRepo.save(modificador)

    const actionUser = await userRepo.findOne({ where: { email: userEmail } })

    if (!actionUser) {
      throw new Error('USER_NOT_FOUND')
    }

    //Logs
    createLog(
      actionUser,
      `Actualizo el modificador con el id ${id}`,
      ActionType.Update
    )

    return { message: 'Modificador updated successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const deleteModifier = async (id: number, userEmail: string) => {
  try {
    const modificador = await modificadorRepo.findOne({
      where: { id },
      relations: ['clave']
    })
    if (!modificador) throw new Error('MODIFICADOR_NOT_FOUND')

    if (modificador.clave) {
      await claveRepo.remove(modificador.clave)
    }

    await modificadorRepo.remove(modificador)

    const actionUser = await userRepo.findOne({ where: { email: userEmail } })

    if (!actionUser) {
      throw new Error('USER_NOT_FOUND')
    }

    //Logs
    createLog(
      actionUser,
      `Elimino el modificador con el ID: ${id}`,
      ActionType.Delete
    )

    return { message: 'Modificador deleted successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

export {
  insertModifier,
  getModifiers,
  getModifierById,
  updateModifier,
  deleteModifier
}
