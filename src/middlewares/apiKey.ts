import { Request, Response, NextFunction } from 'express'
import { validateApiKey } from '../services/auth'

const apiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get API key from request header
    const apiKey = req.header('x-api-key')
    console.log('Received API Key:', apiKey) // Logging for debugging

    if (!apiKey) {
      // Log the missing API key for better visibility
      console.warn('API Key missing from request')
      return res.status(401).json({ message: 'API Key is required' })
    }

    // Validate the API key using the service
    const apiKeyRecord = await validateApiKey(apiKey)
    console.log('API Key validation result:', apiKeyRecord) // Logging for debugging

    if (!apiKeyRecord) {
      // If validation fails, log the invalid API key attempt
      console.warn('Invalid API Key:', apiKey)
      return res.status(403).json({ message: 'Invalid API Key' })
    }

    // Proceed to the next middleware if the API key is valid
    next()
  } catch (error: unknown) {
    // Type casting the 'error' to an 'Error' type
    if (error instanceof Error) {
      // Log the error stack for better visibility into the issue
      console.error('Error in API Key Middleware:', error)
      return res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message })
    } else {
      // If the error isn't an instance of Error, send a generic message
      console.error('Unexpected error:', error)
      return res.status(500).json({ message: 'Internal Server Error' })
    }
  }
}

export { apiKeyMiddleware }
