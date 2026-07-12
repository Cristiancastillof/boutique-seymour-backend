import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const localConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 5432)
}

const productionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
}

const pool = new Pool(
  process.env.DATABASE_URL ? productionConfig : localConfig
)

pool.on('error', (error) => {
  console.error('Error inesperado en PostgreSQL:', error.message)
})

export default pool
