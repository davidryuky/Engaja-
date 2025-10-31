import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

// Esta função assume que está rodando em um ambiente serverless
// onde as variáveis process.env são populadas pelo provedor de hospedagem.
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const saltRounds = 10;

// O handler de API, projetado para plataformas como Vercel/Netlify.
// A assinatura exata (req, res) pode variar, mas esta é a mais comum.
export default async (req, res) => {
  // Verifica se as variáveis de ambiente essenciais estão definidas.
  if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
      console.error("As variáveis de ambiente do banco de dados não estão configuradas.");
      return res.status(500).json({ success: false, message: "Erro de configuração do servidor." });
  }

  // Permite apenas requisições POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Método ${req.method} não permitido.` });
  }
  
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
  }

  let connection;
  try {
    // Para ambientes serverless, é mais seguro criar uma conexão por requisição.
    connection = await mysql.createConnection(dbConfig);

    // 1. Cria a tabela 'users' se ela não existir.
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Procura pelo usuário no banco.
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);

    // 3. Se o usuário não existe (primeiro login).
    if (rows.length === 0) {
      if (username === 'May' && password === 'MAY@@umi') {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await connection.execute(
          'INSERT INTO users (username, password_hash) VALUES (?, ?)',
          [username, hashedPassword]
        );
        res.status(200).json({ success: true, message: 'Administrador criado e logado com sucesso.' });
      } else {
        res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
      }
    } else {
      // 4. Se o usuário já existe (login normal).
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (passwordMatch) {
        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
      }
    }

  } catch (error) {
    console.error('[API_ERROR]', error);
    res.status(500).json({ success: false, message: 'Erro de servidor. Verifique a conexão com o BD e as variáveis de ambiente.' });
  } finally {
    // Garante que a conexão com o banco de dados seja sempre fechada.
    if (connection) connection.end();
  }
};
