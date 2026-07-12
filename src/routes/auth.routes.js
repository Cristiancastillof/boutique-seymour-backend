import { Router } from 'express'
import {
  getProfile,
  loginUser,
  registerUser
} from '../controllers/auth.controller.js'
import {
  validateLogin,
  validateRegister
} from '../middlewares/validate.middleware.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/register', validateRegister, registerUser)
router.post('/login', validateLogin, loginUser)
router.get('/profile', verifyToken, getProfile)

export default router