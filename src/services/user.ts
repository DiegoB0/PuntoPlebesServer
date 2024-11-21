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

    if (error) {
      throw new Error('FAILED_TO_INSERT_USER')
    }

    if (!data || data.length === 0) {
      throw new Error('FAILED_TO_FETCH_USER')
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

    if (!data || data.length === 0) {
      throw new Error('NO_USERS_FOUND')
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

const getUserById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error('FAILED_TO_FETCH_USER')
    }

    if (!data || data.length === 0) {
      throw new Error('NO_USER_FOUND')
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

const updateUser = async (id: string, user: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id)
      .select()

    if (error) {
      throw new Error('UPDATE_ERROR')
    }

    if (!data || data.length === 0) {
      throw new Error('USER_NOT_FOUND')
    }

    return { message: 'User updated successfully' }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const deleteUser = async (id: string) => {
  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)

    if (fetchError) {
      throw new Error('FETCH_ERROR')
    }

    if (!existingUser || existingUser.length === 0) {
      throw new Error('ITEM_NOT_FOUND')
    }

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw new Error('DELETE_ERROR')
    }

    return { message: 'User deleted successfully' }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

export { insertUser, getUsers, getUserById, updateUser, deleteUser }
