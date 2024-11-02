import { Router } from 'express'
import {
  addItems,
  removeItems,
  getItem,
  getItems,
  changeItems
} from '../controllers/user'
import { checkJwt } from '../middlewares/sessions'

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
router.get('/', checkJwt, getItems)

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
router.get('/:id', checkJwt, getItem)

/**
 * Route to add a new user
 * Method: [POST]
 * Endpoint: http://localhost:5000/user
 * @route POST /user
 * @description Add a new user to the database
 * @body {Object} user - The user data to add
 * @returns {Object} 201 - The newly added user
 * @returns {Error} 400 - Invalid request data
 * @returns {Error} 500 - Internal server error
 */
router.post('/', checkJwt, addItems)

/**
 * Route to update users
 * Method: [PUT]
 * Endpoint: http://localhost:5000/user/:id
 * @route PUT /user/:id
 * @description Update existing user
 * @param {string} id - The ID of the user to update
 * @body {Object} user - The user data to update
 * @returns {Object} 200 - A confirmation of the update
 * @returns {Error} 400 - Invalid request data
 * @returns {Error} 500 - Internal server error
 */
router.put('/:id', checkJwt, changeItems)

/**
 * Route to delete specific users by ID
 * Method: [DELETE]
 * Endpoint: http://localhost:5000/user/:id
 * @route DELETE /user/:id
 * @param {string} id - The ID of the user to delete
 * @description Delete a specific user by its ID
 * @returns {Object} 200 - Confirmation of deletion
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Internal server error
 */
router.delete('/:id', checkJwt, removeItems)

export { router }
