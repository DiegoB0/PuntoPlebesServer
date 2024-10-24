import { Router } from 'express'
import {
  addItems,
  removeItems,
  getItem,
  getItems,
  changeItems
} from '../controllers/user'

const router = Router()

/**
 * Route to get all users
 * Method: [GET]
 * Endpoint: http://localhost:5000/user
 * @route GET /user
 * @description Fetch all users from the database
 * @returns {Array<Object>} 200 - An array of users
 * @returns {Error} 500 - Internal server error
 */
router.get('/', getItems)

/**
 * Route to get a single user by ID
 * Method: [GET]
 * Endpoint: http://localhost:5000/user/:id
 * @route GET /user/:id
 * @param {string} id - The ID of the user
 * @description Fetch a single user by its ID
 * @returns {Object} 200 - The user with the given ID
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Internal server error
 */
router.get('/:id', getItem)

/**
 * Route to add a new user
 * Method: [PUT]
 * Endpoint: http://localhost:5000/user/:id
 * @route PUT /user/:id
 * @param {string} id - The ID of the user to add
 * @body {Object} user - The user data to add
 * @description Add a new user to the database
 * @returns {Object} 201 - The newly added user
 * @returns {Error} 400 - Invalid request data
 * @returns {Error} 500 - Internal server error
 */
router.post('/', changeItems)

/**
 * Route to update users
 * Method: [POST]
 * Endpoint: http://localhost:5000/user
 * @route POST /user
 * @description Update existing users
 * @body {Array<Object>} users - An array of users to update
 * @returns {Object} 200 - A confirmation of the update
 * @returns {Error} 400 - Invalid request data
 * @returns {Error} 500 - Internal server error
 */
router.put('/:id', addItems)

/**
 * Route to delete an user by ID
 * Method: [DELETE]
 * Endpoint: http://localhost:5000/user/:id
 * @route DELETE /user/:id
 * @param {string} id - The ID of the user to delete
 * @description Delete a specific user by its ID
 * @returns {Object} 200 - Confirmation of deletion
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Internal server error
 */
router.delete('/:id', removeItems)

export { router }
