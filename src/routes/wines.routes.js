import { Router } from 'express'
import {
  createWine,
  deleteWine,
  getAllWines,
  getWineById,
  updateWine
} from '../controllers/wines.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', getAllWines)
router.get('/:id', getWineById)
router.post('/', verifyToken, createWine)
router.put('/:id', verifyToken, updateWine)
router.delete('/:id', verifyToken, deleteWine)

export default router