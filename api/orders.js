// api/orders.js

const mysql = require('mysql2/promise');

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
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } finally {
        connection.release();
    }
}

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await initializeDatabase();
        const connection = await pool.getConnection();

        try {
            if (req.method === 'GET') {
                const [rows] = await connection.execute('SELECT * FROM orders ORDER BY created_at DESC');
                return res.status(200).json({ success: true, orders: rows });
            }

            if (req.method === 'POST') {
                const { orderText } = req.body;
                if (!orderText || typeof orderText !== 'string' || orderText.trim() === '') {
                    return res.status(400).json({ success: false, message: 'O texto do pedido é obrigatório.' });
                }

                await connection.execute('INSERT INTO orders (order_text) VALUES (?)', [orderText.trim()]);
                return res.status(201).json({ success: true, message: 'Pedido adicionado com sucesso.' });
            }

            return res.status(405).json({ success: false, message: 'Method Not Allowed' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
};
