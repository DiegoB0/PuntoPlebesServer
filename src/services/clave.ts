import { AppDataSource } from '../config/typeorm'
import { Repository } from 'typeorm'
import { Clave } from '../entities/Claves.entity'
import { TipoClave } from '../entities/enums/Clave.enum'

const claveRepo: Repository<Clave> = AppDataSource.getRepository(Clave)

const insertPlainClave = async ({
  palabra,
  clave
}: {
  palabra: string
  clave: string
}) => {
  try {
    const newClave = claveRepo.create({
      palabra,
      clave,
      tipo_clave: TipoClave.Extra
    })

    await claveRepo.save(newClave)

    return { message: 'Plain Clave created successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getAllClaves = async () => {
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

const updateClave = async (id: number, updateData: Partial<Clave>) => {
  try {
    const clave = await claveRepo.findOne({ where: { id } })
    if (!clave) throw new Error('CLAVE_NOT_FOUND')

    claveRepo.merge(clave, updateData)
    await claveRepo.save(clave)

    return { message: 'Clave updated successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const deleteClave = async (id: number) => {
  try {
    const clave = await claveRepo.findOne({ where: { id } })
    if (!clave) throw new Error('CLAVE_NOT_FOUND')

    await claveRepo.remove(clave)

    return { message: 'Clave deleted successfully' }
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

export {
  insertPlainClave,
  getAllClaves,
  getClaveById,
  updateClave,
  deleteClave
}
