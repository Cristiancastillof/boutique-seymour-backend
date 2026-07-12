export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Nombre, email y contraseña son obligatorios'
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'La contraseña debe tener al menos 6 caracteres'
    })
  }

  next()
}

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email y contraseña son obligatorios'
    })
  }

  next()
}