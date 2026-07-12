import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  try {
    const authorization = req.header('Authorization')

    if (!authorization) {
      return res.status(401).json({
        error: 'Token no proporcionado'
      })
    }

    const [type, token] = authorization.split(' ')

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    })
  }
}