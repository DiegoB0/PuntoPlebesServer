import { User } from '../interfaces/user.interface'
import supabase from '../config/supabase'

/**
 * Insert a new user into the database
 * @param {User} user - User object containing name, email, password, and role
 * @returns {Promise<Object | null>} - Inserted user data or null in case of error
 */
const insertUser = async (user: User) => {
  try {
    // Check if the email already exists
    const { data: existingUser, error: emailCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single() // Use single to return only one record

    if (emailCheckError) {
      console.error('Error checking email:', emailCheckError.message)
      return null // Handle errors accordingly
    }

    if (existingUser) {
      console.error('User already exists with this email:', user.email)
      return { error: 'User already exists with this email.' }
    }

    // If no existing user, proceed to insert the new user
    const { data, error } = await supabase.from('users').insert([user])

    if (error) {
      console.error('Error inserting user:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error inserting user:', err)
    return null
  }
}

/**
 * Get all users from the database
 * @returns {Promise<User[] | null>} - List of users or null in case of error
 */
const getUsers = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*')

    if (error) {
      console.error('Error fetching users:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error fetching users:', err)
    return null
  }
}

/**
 * Get a user by ID
 * @param {string} id - The ID of the user to fetch
 * @returns {Promise<User | null>} - The user object or null in case of error
 */
const getUserById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching user:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error fetching user:', err)
    return null
  }
}

/**
 * Update a user in the database
 * @param {string} id - The ID of the user to update
 * @param {Partial<User>} user - User object containing the fields to update
 * @returns {Promise<Object | null>} - Updated user data or null in case of error
 */
const updateUser = async (id: string, user: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id)

    if (error) {
      console.error('Error updating user:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error updating user:', err)
    return null
  }
}

/**
 * Delete a user from the database
 * @param {string} id - The ID of the user to delete
 * @returns {Promise<Object | null>} - Deleted user data or null in case of error
 */
const deleteUser = async (id: string) => {
  try {
    const { data, error } = await supabase.from('users').delete().eq('id', id)

    if (error) {
      console.error('Error deleting user:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error deleting user:', err)
    return null
  }
}

export { insertUser, getUsers, getUserById, updateUser, deleteUser }
