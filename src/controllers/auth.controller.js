import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const userExistsQuery = 'SELECT * FROM users WHERE email = $1'
    const userExists = await pool.query(userExistsQuery, [email])

    if (userExists.rows.length > 0) {
      return res.status(409).json({
        error: 'El email ya está registrado'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
    `

    const values = [
      name,
      email,
      hashedPassword,
      role || 'comprador'
    ]

    const { rows } = await pool.query(query, values)
    const user = rows[0]

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2h'
      }
    )

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al registrar usuario'
    })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const query = 'SELECT * FROM users WHERE email = $1'
    const { rows } = await pool.query(query, [email])

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      })
    }

    const user = rows[0]
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2h'
      }
    )

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al iniciar sesión'
    })
  }
}

export const getProfile = async (req, res) => {
  try {
    const query = `
      SELECT id, name, email, role, created_at
      FROM users
      WHERE id = $1
    `

    const { rows } = await pool.query(query, [req.user.id])

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      })
    }

    res.status(200).json(rows[0])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al obtener perfil'
    })
  }
}