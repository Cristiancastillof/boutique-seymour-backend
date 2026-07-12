import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import winesRoutes from './routes/wines.routes.js'
import favoritesRoutes from './routes/favorites.routes.js'
import ordersRoutes from './routes/orders.routes.js'

const app = express()

const allowedOrigins = (
  process.env.CORS_ORIGIN || 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Origen no permitido por CORS'))
    }
  })
)

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'API REST Boutique Seymour funcionando correctamente'
  })
})

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    project: 'Boutique Seymour Backend'
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/wines', winesRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/orders', ordersRoutes)

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  })
})

app.use((error, req, res, next) => {
  console.error(error)

  if (error.message === 'Origen no permitido por CORS') {
    return res.status(403).json({
      error: error.message
    })
  }

  return res.status(500).json({
    error: 'Error interno del servidor'
  })
})

export default app
