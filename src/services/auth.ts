import { Auth } from '../interfaces/auth.interface'
import supabase from '../config/supabase'

const registerNewUser = async (authUser: Auth) => {
  try {
    // Check if the email already exists
    const { data: existingUser, error: emailCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single() // Use single to return only one record

    if (emailCheckError) {
      console.error('Error checking email:', emailCheckError.message)
      return { error: 'Invalid email' }
    }

    if (existingUser) {
      console.error('User already exists with this email:', authUser.email)
      return { error: 'User already exists with this email.' }
    }

    // If no existing user, proceed to insert the new user
    const { data, error } = await supabase.from('users').insert([authUser])

    if (error) {
      console.error('Error inserting user:', error.message)
      return { error: 'Error inserting user' }
    }

    return data
  } catch (err) {
    console.error('Unexpected error inserting user:', err)
    return null
  }
}

const loginUser = async () => {}

export { registerNewUser, loginUser }
