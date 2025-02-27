import { AppDataSource } from '../config/typeorm'
import { Repository } from 'typeorm'
import { Modificador } from '../entities/Modificadores.entity'
import { Clave } from '../entities/Claves.entity'
import { TipoClave } from '../entities/enums/Clave.enum'
import { Menu } from '../entities/enums/Menu.enum'

const modificadorRepo: Repository<Modificador> =
  AppDataSource.getRepository(Modificador)
const claveRepo: Repository<Clave> = AppDataSource.getRepository(Clave)

const insertModifier = async ({
  name,
  description,
  meal_type,
  claveData
}: any) => {
  try {
    if (!Object.values(Menu).includes(meal_type)) {
      throw new Error('INVALID_MEAL_TYPE')
    }

    const clave = claveRepo.create({
      palabra: claveData.palabra,
      clave: claveData.clave,
      tipo_clave: TipoClave.Modificador
    })

    await claveRepo.save(clave)

    const modificador = modificadorRepo.create({
      name,
      description,
      meal_type,
      clave
    })

    await modificadorRepo.save(modificador)

    return { message: 'Modificador created successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getModifiers = async () => {
  try {
    const modificadores = await modificadorRepo.find({ relations: ['clave'] })
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
      relations: ['clave']
    })
    if (!modificador) throw new Error('MODIFICADOR_NOT_FOUND')

    return modificador
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const updateModifier = async (id: number, updateData: any) => {
  try {
    const modificador = await modificadorRepo.findOne({
      where: { id },
      relations: ['clave']
    })
    if (!modificador) throw new Error('MODIFICADOR_NOT_FOUND')

    if (
      updateData.meal_type &&
      !Object.values(Menu).includes(updateData.meal_type)
    ) {
      throw new Error('INVALID_MEAL_TYPE')
    }

    modificadorRepo.merge(modificador, updateData)
    await modificadorRepo.save(modificador)

    return { message: 'Modificador updated successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const deleteModifier = async (id: number) => {
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
