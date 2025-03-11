import { Request, Response } from 'express'
import {
  insertUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../services/user'
import { handleHttp } from '../utils/error_handler'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { InsertUserDTO, UpdateUserDTO } from '../dtos/user/request.dto'
import { RequestWithUser } from '../middlewares/sessions'

const addItems = async (req: Request, res: Response) => {
  try {
    const body = req.body

    const userEmail = (req as RequestWithUser).userEmail
    if (!userEmail) {
      return res.status(400).json({
        message: 'Not user associated with this operation'
      })
    }

    const newUser = plainToInstance(InsertUserDTO, body)
    const errors = await validate(newUser)
    if (errors.length > 0) return res.status(400).json({ errors })

    const createdUser = await insertUser(body, userEmail)
    res.status(201).json(createdUser)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

const getItems = async (_req: Request, res: Response) => {
  try {
    const users = await getUsers()
    res.status(200).json(users)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

const getItem = async ({ params }: Request, res: Response) => {
  try {
    const user = await getUserById(Number(params.id))
    res.status(200).json(user)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

const updateItems = async (req: Request, res: Response) => {
  try {

    const userEmail = (req as RequestWithUser).userEmail
    if (!userEmail) {
      return res.status(400).json({
        message: 'Not user associated with this operation'
      })
    }
    const { body, params } = req

    const updatedUserData = plainToInstance(UpdateUserDTO, body)
    const errors = await validate(updatedUserData)
    if (errors.length > 0) return res.status(400).json({ errors })

    const updatedUser = await updateUser(Number(params.id), body, userEmail)
    res.status(200).json(updatedUser)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

const removeItems = async (req: Request, res: Response) => {
  try {

    const userEmail = (req as RequestWithUser).userEmail
    if (!userEmail) {
      return res.status(400).json({
        message: 'Not user associated with this operation'
      })
    }
    const { params } = req
    const result = await deleteUser(Number(params.id), userEmail)
    res.status(200).json(result)
  } catch (e: any) {
    handleHttp(res, e.message, e.statusCode || 500, e)
  }
}

export { addItems, getItems, getItem, updateItems, removeItems }
