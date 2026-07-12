import app from './app.js'
import pool from './config/db.js'

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()')
    console.log('Conexión a PostgreSQL exitosa')

    app.listen(PORT, () => {
      console.log(`Servidor Boutique Seymour corriendo en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error.message)
  }
}

startServer()