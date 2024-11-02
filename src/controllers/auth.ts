import { Request, Response } from 'express'
import { loginUser, registerUser } from '../services/auth'

const registerController = async ({ body }: Request, res: Response) => {
  const responseUser = await registerUser(body)
  res.status(201).json(responseUser);
}

const loginController = async ({ body }: Request, res: Response) => {
  const responseLogin = await loginUser(body)
  res.status(201).json(responseLogin)
}

export { registerController, loginController }
