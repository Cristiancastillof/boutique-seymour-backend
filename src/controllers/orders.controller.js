import pool from '../config/db.js'

export const createOrder = async (req, res) => {
  const client = await pool.connect()

  try {
    const { items } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'La orden debe contener al menos un producto'
      })
    }

    await client.query('BEGIN')

    let total = 0
    const validatedItems = []

    for (const item of items) {
      const { wine_id, quantity } = item

      if (!wine_id || !quantity || quantity <= 0) {
        await client.query('ROLLBACK')

        return res.status(400).json({
          error: 'Cada producto debe incluir wine_id y quantity válido'
        })
      }

      const wineQuery = 'SELECT * FROM wines WHERE id = $1'
      const wineResult = await client.query(wineQuery, [wine_id])

      if (wineResult.rows.length === 0) {
        await client.query('ROLLBACK')

        return res.status(404).json({
          error: `Vino con id ${wine_id} no encontrado`
        })
      }

      const wine = wineResult.rows[0]

      if (wine.stock < quantity) {
        await client.query('ROLLBACK')

        return res.status(400).json({
          error: `Stock insuficiente para ${wine.name}`
        })
      }

      total += wine.price * quantity

      validatedItems.push({
        wine_id: wine.id,
        quantity,
        unit_price: wine.price
      })
    }

    const orderQuery = `
      INSERT INTO orders (user_id, total, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `

    const orderResult = await client.query(orderQuery, [
      req.user.id,
      total,
      'pendiente'
    ])

    const order = orderResult.rows[0]

    for (const item of validatedItems) {
      const orderItemQuery = `
        INSERT INTO order_items (order_id, wine_id, quantity, unit_price)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `

      await client.query(orderItemQuery, [
        order.id,
        item.wine_id,
        item.quantity,
        item.unit_price
      ])

      const updateStockQuery = `
        UPDATE wines
        SET stock = stock - $1
        WHERE id = $2
      `

      await client.query(updateStockQuery, [
        item.quantity,
        item.wine_id
      ])
    }

    await client.query('COMMIT')

    res.status(201).json({
      message: 'Orden creada correctamente',
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        created_at: order.created_at,
        items: validatedItems
      }
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)

    res.status(500).json({
      error: 'Error al crear orden'
    })
  } finally {
    client.release()
  }
}

export const getOrders = async (req, res) => {
  try {
    const ordersQuery = `
      SELECT id, total, status, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `

    const ordersResult = await pool.query(ordersQuery, [req.user.id])
    const orders = ordersResult.rows

    for (const order of orders) {
      const itemsQuery = `
        SELECT 
          order_items.id,
          order_items.quantity,
          order_items.unit_price,
          wines.id AS wine_id,
          wines.name,
          wines.type,
          wines.grape,
          wines.image_url
        FROM order_items
        JOIN wines ON order_items.wine_id = wines.id
        WHERE order_items.order_id = $1
      `

      const itemsResult = await pool.query(itemsQuery, [order.id])
      order.items = itemsResult.rows
    }

    res.status(200).json(orders)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error al obtener órdenes'
    })
  }
}