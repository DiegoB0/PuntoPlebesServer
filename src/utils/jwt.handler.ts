import { sign, verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'token01'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'token02'

const generateToken = async (id: string) => {
  const jwt = sign({ id }, JWT_SECRET, {
    expiresIn: '1h'
  })
  return jwt
}

const verifyToken = (jwt: string) => {
  try {
    const isCorrect = verify(jwt, JWT_SECRET)
    return isCorrect
  } catch (error) {
    console.error('Token verification failed:', error)
    return false
  }
}

const generateRereshToken = async (id: string) => {
  const refreshJwt = sign({ id }, JWT_REFRESH_SECRET, {
    expiresIn: '7d'
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

export { generateToken, generateRereshToken, verifyToken, verifyRefreshToken }
