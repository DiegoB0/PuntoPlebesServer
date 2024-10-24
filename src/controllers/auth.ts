import { Request, Response } from 'express'

const registerController = async (req: Request, res: Response) => {
  const body = req.body
  console.log(body, res)
}

const loginController = async (req: Request, res: Response) => {
  console.log('I will go this later', req, res)
}

export { registerController, loginController }
