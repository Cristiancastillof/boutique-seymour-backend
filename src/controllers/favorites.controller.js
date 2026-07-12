import pool from '../config/db.js'

export const getFavorites = async (req, res) => {
  try {
    const query = `
      SELECT 
        favorites.id AS favorite_id,
        wines.id,
        wines.name,
        wines.type,
        wines.grape,
        wines.country,
        wines.region,
        wines.year,
        wines.price,
        wines.stock,
        wines.description,
        wines.image_url,
        wines.created_at
      FROM favorites
      JOIN wines ON favorites.wine_id = wines.id
      WHERE favorites.user_id = $1
      ORDER BY favorites.created_at DESC
    `

    const { rows } = await pool.query(query, [req.user.id])

    res.status(200).json(rows)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al obtener favoritos'
    })
  }
}

export const addFavorite = async (req, res) => {
  try {
    const { wine_id } = req.body

    if (!wine_id) {
      return res.status(400).json({
        error: 'El id del vino es obligatorio'
      })
    }

    const wineQuery = 'SELECT * FROM wines WHERE id = $1'
    const wineResult = await pool.query(wineQuery, [wine_id])

    if (wineResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Vino no encontrado'
      })
    }

    const query = `
      INSERT INTO favorites (user_id, wine_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, wine_id) DO NOTHING
      RETURNING *
    `

    const { rows } = await pool.query(query, [req.user.id, wine_id])

    if (rows.length === 0) {
      return res.status(200).json({
        message: 'El vino ya estaba en favoritos'
      })
    }

    res.status(201).json({
      message: 'Vino agregado a favoritos',
      favorite: rows[0]
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al agregar favorito'
    })
  }
}

export const removeFavorite = async (req, res) => {
  try {
    const { wineId } = req.params

    const query = `
      DELETE FROM favorites
      WHERE user_id = $1 AND wine_id = $2
      RETURNING *
    `

    const { rows } = await pool.query(query, [req.user.id, wineId])

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Favorito no encontrado'
      })
    }

    res.status(200).json({
      message: 'Favorito eliminado correctamente'
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al eliminar favorito'
    })
  }
}