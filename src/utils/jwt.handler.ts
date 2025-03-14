import { JwtPayload, sign, verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'token01'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'token02'

const generateToken = async (user: { email: string; role: string }) => {
  const jwt = sign({ email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '2h'
  })
  return jwt
}

const verifyToken = (jwt: string) => {
  try {
    const decoded = verify(jwt, JWT_SECRET) as JwtPayload
    if (!decoded.email) {
      return false
    }
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return false
  }
}

const generateRefreshToken = async (email: string) => {
  const refreshJwt = sign({ email }, JWT_REFRESH_SECRET, {
    expiresIn: '2d'
  })
  return refreshJwt
}

const verifyRefreshToken = (refreshJwt: string) => {
  try {
    const isCorrect = verify(refreshJwt, JWT_REFRESH_SECRET)
    return isCorrect
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return false
  }
}

export { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken }
