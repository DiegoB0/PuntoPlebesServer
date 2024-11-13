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
      console.error('Error checking email:', emailCheckError.message)
      return { error: 'Invalid email' }
    }

    if (existingUser) {
      console.error('User already exists with this email:', email)
      return { error: 'User already exists with this email.' }
    }

    //Assign user role by default
    const role = 'user'
    const passHash = await encrypt(password)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ email, password: passHash, name, role })

    if (error) {
      console.error('Error inserting user:', error.message)
      return { error: 'Error inserting user' }
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
  } catch (err) {
    console.error('Unexpected error inserting user:', err)
    return null
  }
}

const loginUser = async ({ email, password }: Auth) => {
  try {
    const { data: existingUser, error: emailCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (emailCheckError) {
      console.error('Error checking email:', emailCheckError.message)
      return { error: 'Invalid email' }
    }

    if (!existingUser) return 'USER_NOT_FOUND'

    const parsedUser = JSON.parse(JSON.stringify(existingUser))
    const passwordHash = parsedUser.password

    //Check if the passwords match
    const isCorrect = await verified(password, passwordHash)
    if (!isCorrect) return 'PASSWORD_INCORRECT'

    //Generate jsonwebtoken
    const token = await generateToken(parsedUser.email)
    const refreshToken = await generateRereshToken(parsedUser.email)

    const data = {
      token,
      refreshToken,
      message: 'Sign in success'
    }

    return data
  } catch (err) {
    console.error('Unexpected error inserting user:', err)
    return null
  }
}

export { registerUser, loginUser }
