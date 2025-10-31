import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../db.js';

const router = Router();
const saltRounds = 10;

// Rota de Login: POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
  }

  let connection;
  try {
    connection = await db.getConnection();

    // 1. Cria a tabela 'users' se ela ainda não existir.
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Procura pelo usuário no banco de dados
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);

    // 3. Se o usuário NÃO existir (primeiro login)
    if (rows.length === 0) {
      if (username === 'May' && password === 'MAY@@umi') {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await connection.execute(
          'INSERT INTO users (username, password_hash) VALUES (?, ?)',
          [username, hashedPassword]
        );
        return res.status(200).json({ success: true, message: 'Administrador criado e logado com sucesso.' });
      } else {
        return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
      }
    }

    // 4. Se o usuário JÁ EXISTIR (login normal)
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (passwordMatch) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
    }

  } catch (error) {
    console.error('[DATABASE_ERROR]:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor. Verifique a conexão com o banco de dados.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;
