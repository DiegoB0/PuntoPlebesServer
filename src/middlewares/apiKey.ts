import { Request, Response, NextFunction } from 'express'
import { validateApiKey } from '../services/auth'

const apiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.header('x-api-key')

    if (!apiKey) {
      return res.status(401).json({ message: 'API Key missing' })
    }

    // Validate the API key using the service
    const apiKeyRecord = await validateApiKey(apiKey)

    if (!apiKeyRecord) {
      return res.status(403).json({ message: 'Invalid API Key' })
    }

    next()
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export { apiKeyMiddleware }
