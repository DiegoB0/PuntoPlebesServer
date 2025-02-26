import { Router } from 'express'
import {
  addItems,
  getItems,
  getItem,
  updateItems,
  removeItems
} from '../controllers/category'

const router = Router()

router.post('/', addItems)
router.get('/', getItems)
router.get('/:id', getItem)
router.get('/:id', updateItems)
router.delete('/:id', removeItems)

export { router }
