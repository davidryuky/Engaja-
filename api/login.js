import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const saltRounds = 10;

// A Vercel gerencia as conexões, mas um pool ainda é uma boa prática.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

async function createTableIfNotExists() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    connection.release();
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
  }

  try {
    await createTableIfNotExists();
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
      
      if (rows.length === 0) {
        // User not found, check if it's the initial admin login
        if (username === 'May' && password === 'MAY@@umi') {
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          await connection.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
          return res.status(200).json({ success: true, message: 'Admin user created and logged in.' });
        } else {
          return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }
      } else {
        // User found, compare passwords
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
          return res.status(200).json({ success: true, message: 'Login bem-sucedido.' });
        } else {
          return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
}
