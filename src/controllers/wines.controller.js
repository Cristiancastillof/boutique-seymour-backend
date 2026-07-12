import pool from '../config/db.js'

export const getAllWines = async (req, res) => {
  try {
    const query = `
      SELECT 
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
        wines.created_at,
        users.id AS seller_id,
        users.name AS seller_name,
        users.email AS seller_email
      FROM wines
      JOIN users ON wines.user_id = users.id
      ORDER BY wines.created_at DESC
    `

    const { rows } = await pool.query(query)

    res.status(200).json(rows)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al obtener vinos'
    })
  }
}

export const getWineById = async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT 
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
        wines.created_at,
        users.id AS seller_id,
        users.name AS seller_name,
        users.email AS seller_email
      FROM wines
      JOIN users ON wines.user_id = users.id
      WHERE wines.id = $1
    `

    const { rows } = await pool.query(query, [id])

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Vino no encontrado'
      })
    }

    res.status(200).json(rows[0])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al obtener detalle del vino'
    })
  }
}

export const createWine = async (req, res) => {
  try {
    const {
      name,
      type,
      grape,
      country,
      region,
      year,
      price,
      stock,
      description,
      image_url
    } = req.body

    if (
      !name ||
      !type ||
      !grape ||
      !country ||
      !region ||
      !year ||
      !price ||
      !stock ||
      !description ||
      !image_url
    ) {
      return res.status(400).json({
        error: 'Todos los campos del vino son obligatorios'
      })
    }

    const query = `
      INSERT INTO wines (
        user_id, name, type, grape, country, region, year, price, stock, description, image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `

    const values = [
      req.user.id,
      name,
      type,
      grape,
      country,
      region,
      Number(year),
      Number(price),
      Number(stock),
      description,
      image_url
    ]

    const { rows } = await pool.query(query, values)

    res.status(201).json({
      message: 'Publicación creada correctamente',
      wine: rows[0]
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al crear publicación'
    })
  }
}

export const updateWine = async (req, res) => {
  try {
    const { id } = req.params

    const {
      name,
      type,
      grape,
      country,
      region,
      year,
      price,
      stock,
      description,
      image_url
    } = req.body

    const wineExistsQuery = 'SELECT * FROM wines WHERE id = $1'
    const wineExists = await pool.query(wineExistsQuery, [id])

    if (wineExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Vino no encontrado'
      })
    }

    if (wineExists.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permiso para editar esta publicación'
      })
    }

    const query = `
      UPDATE wines
      SET 
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        grape = COALESCE($3, grape),
        country = COALESCE($4, country),
        region = COALESCE($5, region),
        year = COALESCE($6, year),
        price = COALESCE($7, price),
        stock = COALESCE($8, stock),
        description = COALESCE($9, description),
        image_url = COALESCE($10, image_url)
      WHERE id = $11
      RETURNING *
    `

    const values = [
      name,
      type,
      grape,
      country,
      region,
      year ? Number(year) : null,
      price ? Number(price) : null,
      stock ? Number(stock) : null,
      description,
      image_url,
      id
    ]

    const { rows } = await pool.query(query, values)

    res.status(200).json({
      message: 'Publicación actualizada correctamente',
      wine: rows[0]
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al actualizar publicación'
    })
  }
}

export const deleteWine = async (req, res) => {
  try {
    const { id } = req.params

    const wineExistsQuery = 'SELECT * FROM wines WHERE id = $1'
    const wineExists = await pool.query(wineExistsQuery, [id])

    if (wineExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Vino no encontrado'
      })
    }

    if (wineExists.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permiso para eliminar esta publicación'
      })
    }

    await pool.query('DELETE FROM wines WHERE id = $1', [id])

    res.status(200).json({
      message: 'Publicación eliminada correctamente'
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al eliminar publicación'
    })
  }
}