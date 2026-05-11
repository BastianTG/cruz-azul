const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cruzazul',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'tu_password',
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10,2),
        stock INTEGER,
        fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await client.query('SELECT COUNT(*) AS count FROM productos');
    if (parseInt(result.rows[0].count) === 0) {
      await client.query(
        'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4)',
        ['Paracetamol 500mg', 'Analgésico y antipirético', 2500, 100]
      );
    }
  } finally {
    client.release();
  }
}

async function main() {
  await initDB();

  const app = express();
  app.use(express.json());
  app.use(express.static('views'));

  app.get('/api/productos', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM productos ORDER BY id');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/productos', async (req, res) => {
    const { nombre, descripcion, precio, stock } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *',
        [nombre, descripcion, precio, stock]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`ERP Cruz Azul corriendo en http://localhost:${PORT}`);
  });
}

main();
