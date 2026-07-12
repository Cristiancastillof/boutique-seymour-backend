DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS wines;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'comprador'
    CHECK (role IN ('comprador', 'vendedor')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wines (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL,
  grape VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  price INTEGER NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wine_id INTEGER NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, wine_id)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total INTEGER NOT NULL CHECK (total >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  wine_id INTEGER NOT NULL REFERENCES wines(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price > 0)
);

CREATE INDEX idx_wines_user_id ON wines(user_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Usuario semilla usado únicamente como propietario de los vinos iniciales.
-- La contraseña queda deshabilitada intencionalmente; crea usuarios desde la app.
INSERT INTO users (name, email, password, role)
VALUES (
  'Boutique Seymour',
  'seed@boutiqueseymour.local',
  'SEED_ACCOUNT_DISABLED',
  'vendedor'
);

INSERT INTO wines (
  user_id,
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
)
VALUES
(
  1,
  'Seymour Cabernet Sauvignon',
  'Tinto',
  'Cabernet Sauvignon',
  'Australia',
  'Victoria',
  2021,
  18990,
  12,
  'Vino tinto elegante, con aromas a frutos rojos, notas suaves de madera y final persistente.',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200'
),
(
  1,
  'Mornington Chardonnay',
  'Blanco',
  'Chardonnay',
  'Australia',
  'Mornington Peninsula',
  2022,
  21990,
  8,
  'Chardonnay fresco y balanceado, con notas cítricas, fruta blanca y textura cremosa.',
  'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?q=80&w=1200'
),
(
  1,
  'Yarra Valley Pinot Noir',
  'Tinto',
  'Pinot Noir',
  'Australia',
  'Yarra Valley',
  2020,
  24990,
  6,
  'Pinot Noir delicado, aromático y frutal, ideal para acompañar carnes blancas y quesos suaves.',
  'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?q=80&w=1200'
),
(
  1,
  'Sparkling Brut Reserve',
  'Espumante',
  'Pinot Noir / Chardonnay',
  'Australia',
  'Tasmania',
  2019,
  27990,
  10,
  'Espumante brut de burbuja fina, acidez refrescante y notas de manzana verde y pan tostado.',
  'https://images.unsplash.com/photo-1547595628-c61a29f496f0?q=80&w=1200'
);
