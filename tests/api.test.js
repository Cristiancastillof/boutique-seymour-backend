import request from 'supertest'
import app from '../src/app.js'
import pool from '../src/config/db.js'

describe('Boutique Seymour API REST', () => {
  let token = ''
  let createdWineId = null

  const testUser = {
    name: 'Usuario Test',
    email: `test${Date.now()}@boutiqueseymour.com`,
    password: '123456',
    role: 'vendedor'
  }

  afterAll(async () => {
    await pool.end()
  })

  test('GET /api/health debe responder 200', async () => {
    const response = await request(app).get('/api/health')

    expect(response.statusCode).toBe(200)
    expect(response.body.status).toBe('ok')
  })

  test('POST /api/auth/register debe registrar usuario y responder 201', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('token')
    expect(response.body).toHaveProperty('user')
    expect(response.body.user.email).toBe(testUser.email)

    token = response.body.token
  })

  test('POST /api/auth/login debe iniciar sesión y responder 200', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(response.body.user.email).toBe(testUser.email)

    token = response.body.token
  })

  test('GET /api/wines debe responder 200 y devolver un arreglo', async () => {
    const response = await request(app).get('/api/wines')

    expect(response.statusCode).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })

  test('GET /api/auth/profile sin token debe responder 401', async () => {
    const response = await request(app).get('/api/auth/profile')

    expect(response.statusCode).toBe(401)
  })

  test('GET /api/auth/profile con token debe responder 200', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.email).toBe(testUser.email)
  })

  test('POST /api/wines sin token debe responder 401', async () => {
    const response = await request(app)
      .post('/api/wines')
      .send({
        name: 'Test Wine Without Token'
      })

    expect(response.statusCode).toBe(401)
  })

  test('POST /api/wines con token debe crear publicación y responder 201', async () => {
    const response = await request(app)
      .post('/api/wines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Seymour Shiraz',
        type: 'Tinto',
        grape: 'Shiraz',
        country: 'Australia',
        region: 'Heathcote',
        year: 2021,
        price: 29990,
        stock: 7,
        description: 'Vino de prueba para test con Supertest.',
        image_url: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?q=80&w=1200'
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('wine')
    expect(response.body.wine.name).toBe('Test Seymour Shiraz')

    createdWineId = response.body.wine.id
  })

  test('GET /api/wines/:id debe responder 200 para vino existente', async () => {
    const response = await request(app).get(`/api/wines/${createdWineId}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.id).toBe(createdWineId)
  })

  test('GET /api/wines/999999 debe responder 404 para vino inexistente', async () => {
    const response = await request(app).get('/api/wines/999999')

    expect(response.statusCode).toBe(404)
  })
})