import { Router } from 'express'
import {
  addFavorite,
  getFavorites,
  removeFavorite
} from '../controllers/favorites.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', verifyToken, getFavorites)
router.post('/', verifyToken, addFavorite)
router.delete('/:wineId', verifyToken, removeFavorite)

export default router