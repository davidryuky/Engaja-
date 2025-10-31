// Usando CommonJS para máxima compatibilidade com ambientes serverless
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuração do banco de dados a partir das suas credenciais
const dbConfig = {
    host: 'srv2021.hstgr.io',
    user: 'u273813631_engaja',
    password: 'DAV@@id519',
    database: 'u273813631_engaja',
    port: 3306,
    connectTimeout: 10000
};

// A função principal que será executada pelo ambiente serverless
module.exports = async (req, res) => {
    // Headers CORS para permitir requisições do frontend
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Em produção, restrinja para o seu domínio
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde à requisição pre-flight do navegador
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Apenas o método POST é permitido
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
    }

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        // 1. Garante que a tabela de usuários exista
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Procura pelo usuário no banco de dados
        const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            // Se o usuário existe, compara a senha
            const user = rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if (passwordMatch) {
                res.status(200).json({ success: true, message: 'Login bem-sucedido!' });
            } else {
                res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
            }
        } else {
            // Se o usuário não existe, verifica se é o primeiro login do administrador
            if (username === 'May' && password === 'MAY@@umi') {
                const hashedPassword = await bcrypt.hash(password, 10); // Criptografa a senha
                await connection.execute(
                    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
                    [username, hashedPassword]
                );
                res.status(200).json({ success: true, message: 'Usuário administrador criado! Login bem-sucedido!' });
            } else {
                // Se não for o admin e não existir, o login falha
                res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
            }
        }
    } catch (error) {
        console.error('Database Connection or Query Error:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor. Verifique as credenciais do banco ou a conexão.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};
