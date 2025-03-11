import { Request, Response } from 'express'
import {
  insertModifier,
  getModifiers,
  getModifierById,
  updateModifier,
  deleteModifier
} from '../services/modifier'
import { handleHttp } from '../utils/error_handler'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import {
  InsertModifierDTO,
  UpdateModifierDTO
} from '../dtos/modifier/request.dto'
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

    const newModifier = plainToInstance(InsertModifierDTO, body)
    const errors = await validate(newModifier)
    if (errors.length > 0) return res.status(400).json({ errors })

    const createdModifier = await insertModifier(body, userEmail)
    res.status(201).json(createdModifier)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

const getItems = async (_req: Request, res: Response) => {
  try {
    const modifiers = await getModifiers()
    res.status(200).json(modifiers)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

const getItem = async ({ params }: Request, res: Response) => {
  try {
    const modifier = await getModifierById(Number(params.id))
    res.status(200).json(modifier)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

const updateItems = async (req: Request, res: Response) => {
  try {

    const { body, params } = req

    const userEmail = (req as RequestWithUser).userEmail
    if (!userEmail) {
      return res.status(400).json({
        message: 'Not user associated with this operation'
      })
    }

    const updateModifierData = plainToInstance(UpdateModifierDTO, body)
    const errors = await validate(updateModifierData)
    if (errors.length > 0) return res.status(400).json({ errors })

    const updatedModifier = await updateModifier(Number(params.id), body, userEmail)
    res.status(200).json(updatedModifier)
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

    const result = await deleteModifier(Number(params.id), userEmail)
    res.status(200).json(result)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

export { addItems, getItems, getItem, updateItems, removeItems }
