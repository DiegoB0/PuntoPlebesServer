import { NextFunction, Request, Response } from 'express'

const catchMealPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    next()
  } catch (e) {
    console.error('JWT verification error:', e)
    res.status(400).json({
      error: 'NO_CURRENT_SESSION',
      message: 'Could not verify session'
    })
  }
}

export { catchMealPhoto }
