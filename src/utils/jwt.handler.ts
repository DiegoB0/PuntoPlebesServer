import { sign, verify } from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || "token01"

const generateToken = async (id: string) => {
  const jwt = sign({ id }, JWT_SECRET, {
    expiresIn: "2h",
  })
  return jwt
}


const verifyToken = (jwt: string) => {
  try {
    const isCorrect = verify(jwt, JWT_SECRET);
    return isCorrect;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
};

export { generateToken, verifyToken }
