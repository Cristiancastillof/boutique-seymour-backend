# Boutique Seymour Backend

API REST para el marketplace Boutique Seymour.

## Desarrollo local

1. Copia `.env.example` como `.env`.
2. Crea la base `boutique_seymour` en PostgreSQL.
3. Ejecuta `script.sql`.
4. Instala y ejecuta:

```bash
npm install
npm run dev
```

## Producción

Variables necesarias:

- `NODE_ENV=production`
- `DATABASE_URL`: connection string PostgreSQL de Neon.
- `JWT_SECRET`: clave larga y privada.
- `CORS_ORIGIN`: URL pública del frontend, sin slash final.

Comprobación:

```txt
GET /api/health
GET /api/wines
```
