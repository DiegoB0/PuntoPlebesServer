import { Router } from 'express'
import {
  addItems,
  getItems,
  getItem,
  updateItems,
  removeItem
} from '../controllers/meal'

const router = Router()

router.post('/', addItems)
router.get('/', getItems)
router.get('/:id', getItem)
router.get('/:id', updateItems)
router.delete('/:id', removeItem)

export { router }
