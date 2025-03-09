import { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt.handler'

export interface RequestWithUser extends Request {
  userEmail?: string
}

const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    // Check if the authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        error: 'NO_AUTH_HEADER',
        message: 'Authorization header is missing'
      })
    }

    // Extract and verify the JWT token
    const jwt = authHeader.split(' ').pop()
    if (!jwt) {
      return res
        .status(401)
        .json({ error: 'INVALID_TOKEN', message: 'Token format is invalid' })
    }

    const userData = verifyToken(jwt)

    if (!userData) {
      return res.status(401).json({
        error: 'INVALID_SESSION',
        message: 'The provided token is invalid'
      })
    }

    ;(req as RequestWithUser).userEmail = userData.email

    next()
  } catch (e) {
    console.error('JWT verification error:', e)
    res.status(400).json({
      error: 'NO_CURRENT_SESSION',
      message: 'Could not verify session'
    })
  }
}

export { checkJwt }
