import express from 'express'
import {
  addItems,
  getItems,
  getItem,
  changeItems,
  removeItems
} from '../controllers/order'

const router = express.Router()

// Route to get the data for the statics
router.get('/reports', (req, res) => {
  res.json('Here goes the reports')
})

// Route to get the data for the reosts
router.get('/statics', (req, res) => {
  res.json('Here goes the statics')
})

// Route to create a new order along with items and item details
router.post('/', addItems)

// Route to get all orders with items and item details
router.get('/', getItems)

// Route to get a specific order by ID along with its items and item details
router.get('/:id', getItem)

// Route to update an order along with its items and item details
router.put('/:id', changeItems)

// Route to delete an order along with its related items and item details
router.delete('/:id', removeItems)

export { router }
