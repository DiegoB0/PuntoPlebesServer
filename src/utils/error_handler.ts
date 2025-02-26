import { Response } from 'express'

const handleHttp = (
  res: Response,
  error: string,
  statusCode = 500,
  errorRaw?: any
) => {
  if (errorRaw) console.error(errorRaw) // Log raw error details
  res.status(statusCode).json({ success: false, error })
}

export { handleHttp }
