// Import required modules
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to initialize the database (create table if not exists)
async function initializeDatabase() {
    const connection = await pool.getConnection();
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } finally {
        connection.release();
    }
}

// Ensure the database is initialized once
let dbInitialized = false;
async function ensureDbInitialized() {
    if (!dbInitialized) {
        await initializeDatabase();
        dbInitialized = true;
    }
}


// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
    
    // Ensure DB is ready before proceeding
    try {
        await ensureDbInitialized();
    } catch (dbError) {
        console.error('Database Initialization Error:', dbError);
        return res.status(500).json({ success: false, message: 'Falha crítica ao inicializar o banco de dados.' });
    }

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
        }

        const connection = await pool.getConnection();
        try {
            // Check if user exists
            const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
            
            if (rows.length === 0) {
                // User not found, check if it's the initial admin login
                if (username === 'May' && password === 'MAY@@umi') {
                    const saltRounds = 10;
                    const hashedPassword = await bcrypt.hash(password, saltRounds);
                    
                    // Insert the new admin user
                    await connection.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword]);
                    
                    return res.status(200).json({ success: true, message: 'Administrador criado e logado com sucesso.' });
                } else {
                    return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
                }
            } else {
                // User found, compare passwords
                const user = rows[0];
                const match = await bcrypt.compare(password, user.password_hash);
                
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
        console.error('API Error:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor. Verifique as credenciais do banco de dados e a conexão.' });
    }
};