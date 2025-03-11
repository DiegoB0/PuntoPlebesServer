import { Request, Response } from 'express'
import {
  insertClave,
  getClaves,
  getClaveById,
  updateClave,
  deleteClave
} from '../services/clave'
import { handleHttp } from '../utils/error_handler'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { InsertClaveDTO, UpdateClaveDTO } from '../dtos/clave/request.dto'
import { RequestWithUser } from '../middlewares/sessions'

const addItems = async (req: Request, res: Response) => {
  try {
    const { body } = req
    const userEmail = (req as RequestWithUser).userEmail
    if (!userEmail) {
      return res.status(400).json({
        message: 'Not user associated with this operation'
      })
    }
    const newClave = plainToInstance(InsertClaveDTO, body)
    const errors = await validate(newClave)
    if (errors.length > 0) return res.status(400).json({ errors })

    const createdClave = await insertClave(body, userEmail)
    res.status(201).json(createdClave)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

const getItems = async (_req: Request, res: Response) => {
  try {
    const claves = await getClaves()
    res.status(200).json(claves)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

const getItem = async ({ params }: Request, res: Response) => {
  try {
    const clave = await getClaveById(Number(params.id))
    res.status(200).json(clave)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

const updateItems = async (req: Request, res: Response) => {
  try {
    const { params, body } = req

    const userEmail = (req as RequestWithUser).userEmail
    if (!userEmail) {
      return res.status(400).json({
        message: 'Not user associated with this operation'
      })
    }
    const updateClaveData = plainToInstance(UpdateClaveDTO, body)
    const errors = await validate(updateClaveData)
    if (errors.length > 0) return res.status(400).json({ errors })

    const updatedClave = await updateClave(Number(params.id), body, userEmail)
    res.status(200).json(updatedClave)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

const removeItems = async (req: Request, res: Response) => {
  try {
    const { params } = req
    const userEmail = (req as RequestWithUser).userEmail
    if (!userEmail) {
      return res.status(400).json({
        message: 'Not user associated with this operation'
      })
    }
    const result = await deleteClave(Number(params.id), userEmail)
    res.status(200).json(result)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

export { addItems, getItems, getItem, updateItems, removeItems }
