import { Router } from 'express'
import {
  createOrder,
  getOrders
} from '../controllers/orders.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', verifyToken, getOrders)
router.post('/', verifyToken, createOrder)

export default router