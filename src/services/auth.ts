import { Auth } from '../interfaces/auth.interface'
import supabase from '../config/supabase'
import { encrypt, verified } from '../utils/bcrypt_handler'
import { User } from '../interfaces/user.interface'
import { generateToken, generateRereshToken } from '../utils/jwt.handler'

const registerUser = async ({ email, password, name }: User) => {
  try {
    // Check if the email already exists
    const { data: existingUser, error: emailCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (emailCheckError) {
      console.log('INVALID EMAIL', emailCheckError)
      const error = new Error('INVALID_EMAIL')
      ;(error as any).status = 422
      throw error
    }

    if (existingUser) {
      console.log('USER ALREADY EXISTS', existingUser)
      const error = new Error('USER_ALREADY_EXISTS')
      ;(error as any).status = 409
      throw error
    }

    //Assign user role by default
    const role = 'user'
    const passHash = await encrypt(password)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ email, password: passHash, name, role })
      .select()

    if (error || !newUser) {
      console.log('INSERTION_ERROR', error)
      throw new Error('INSERTION_ERROR')
    }

    const parsedUser = JSON.parse(JSON.stringify(newUser))

    //Generate jsonwebtoken
    const token = await generateToken(parsedUser.email)
    const refreshToken = await generateRereshToken(parsedUser.email)

    const returnData = {
      token,
      refreshToken,
      message: 'Sign up success'
    }

    return returnData
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      console.log('UNKNOWN_ERROR', error)
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const loginUser = async ({ email, password }: Auth) => {
  try {
    const { data: existingUser, error: emailCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (!existingUser || existingUser.length === 0) {
      throw new Error('USER_NOT_FOUND')
    }

    if (emailCheckError) {
      throw new Error('INVALID_EMAIL')
    }

    const parsedUser = JSON.parse(JSON.stringify(existingUser))
    const passwordHash = parsedUser.password

    //Check if the passwords match
    const isCorrect = await verified(password, passwordHash)
    if (!isCorrect) {
      throw new Error('INCORRECT_PASSWORD')
    }

    //Generate jsonwebtoken
    const token = await generateToken(parsedUser.email)
    const refreshToken = await generateRereshToken(parsedUser.email)

    const data = {
      token,
      refreshToken,
      message: 'Sign in success'
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

export { registerUser, loginUser }
