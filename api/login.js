import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

// Configurações do seu banco de dados Hostinger
const dbConfig = {
  host: 'srv2021.hstgr.io',
  user: 'u273813631_engaja',
  password: 'DAV@@id519',
  database: 'u273813631_engaja',
};

// Esta é a função principal que será executada pelo servidor
// Ela espera um objeto de requisição (req) e resposta (res)
export default async function handler(req, res) {
  // Garante que estamos recebendo um método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
  }

  let connection;
  try {
    // Tenta se conectar ao banco de dados
    connection = await mysql.createConnection(dbConfig);

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
      // Verifica se as credenciais são as de administrador padrão
      if (username === 'May' && password === 'MAY@@umi') {
        const saltRounds = 10;
        // Criptografa a senha antes de salvar
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insere o novo usuário administrador no banco
        await connection.execute(
          'INSERT INTO users (username, password_hash) VALUES (?, ?)',
          [username, hashedPassword]
        );
        
        // Retorna sucesso, pois o usuário foi criado e logado
        return res.status(200).json({ success: true });
      } else {
        // Se não for o admin padrão, nega o acesso
        return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
      }
    }

    // 4. Se o usuário JÁ EXISTIR (login normal)
    const user = rows[0];
    // Compara a senha enviada com a senha criptografada no banco
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (passwordMatch) {
      // Se as senhas baterem, retorna sucesso
      return res.status(200).json({ success: true });
    } else {
      // Se não, retorna erro
      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
    }

  } catch (error) {
    // Em caso de qualquer erro (conexão, etc.), retorna um erro genérico
    console.error('Database Error:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor. Não foi possível conectar ao banco de dados.' });
  } finally {
    // Garante que a conexão com o banco seja sempre fechada
    if (connection) {
      await connection.end();
    }
  }
}
