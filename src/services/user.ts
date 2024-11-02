import { User } from '../interfaces/user.interface'
import supabase from '../config/supabase'
import { encrypt } from '../utils/bcrypt_handler'

const insertUser = async ({ email, password, name, role }: User) => {
  try {
    // Check if the email already exists
    const { data: existingUser, error: emailCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (emailCheckError) {
      throw new Error('FAILED_EMAIL_CHECK')
    }

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    //Encrypt the password
    const passHash = await encrypt(password)

    // Proceed to insert the new user
    const { data, error } = await supabase
      .from('users')
      .insert({ email, password: passHash, name, role })
      .select('*')
    console.log(data)

    if (error) {
      console.error('Error inserting user:', error.message)
      throw new Error('FAILED_TO_INSERT_USER')
    }

    return { message: 'User inserted successfully' }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const getUsers = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*')

    if (error) {
      throw new Error('FAILED_TO_FETCH_USERS')
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error('NO_USERS_FOUND')
    }

    return data
  } catch (err) {
    console.error('Unexpected error fetching users:', err)
    throw new Error('UNKNOWN_ERROR')
  }
}

const getUserById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error fetching user:', err)
    return null
  }
}

const updateUser = async (id: string, user: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id)
      .select()

    console.log(data)

    if (error) {
      console.error('Error updating user:', error.message)
      return null
    }

    return { message: 'User updated successfully' }
  } catch (err) {
    console.error('Unexpected error updating user:', err)
    return null
  }
}

const deleteUser = async (id: string) => {
  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      return { success: false, error: 'FETCH_ERROR' }
    }

    if (!existingUser) {
      return { success: false, error: 'ITEM_NOT_FOUND' }
    }

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return { success: false, error: 'DELETE_ERROR' }
    }

    return { success: true, message: 'User deleted successfully' }
  } catch (err) {
    console.error('Unexpected error deleting user:', err)
    return { success: false, error: 'INTERNAL_ERROR' }
  }
}

export { insertUser, getUsers, getUserById, updateUser, deleteUser }
