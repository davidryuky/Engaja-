// api/suppliers.js
const mysql = require('mysql2/promise');

// Database connection pool - reuse from other files
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Function to initialize the database
async function initializeDatabase() {
    const connection = await pool.getConnection();
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                link TEXT NOT NULL,
                is_favorited BOOLEAN NOT NULL DEFAULT FALSE,
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
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    await ensureDbInitialized();

    try {
        const connection = await pool.getConnection();
        try {
            // GET: Fetch all suppliers
            if (req.method === 'GET') {
                const [rows] = await connection.execute('SELECT * FROM suppliers ORDER BY is_favorited DESC, name ASC');
                return res.status(200).json({ success: true, suppliers: rows });
            }

            // POST: Create a new supplier
            if (req.method === 'POST') {
                const { name, link } = req.body;
                if (!name || !link) {
                    return res.status(400).json({ success: false, message: 'Nome e link são obrigatórios.' });
                }
                const [result] = await connection.execute(
                    'INSERT INTO suppliers (name, link) VALUES (?, ?)',
                    [name, link]
                );
                const [[newSupplier]] = await connection.execute('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);
                return res.status(201).json({ success: true, supplier: newSupplier });
            }
            
            // PUT: Update a supplier (for favoriting)
            if (req.method === 'PUT') {
                const { id, is_favorited } = req.body;
                if (!id || is_favorited === undefined) {
                    return res.status(400).json({ success: false, message: 'ID do fornecedor e status de favorito são obrigatórios.' });
                }
                await connection.execute(
                    'UPDATE suppliers SET is_favorited = ? WHERE id = ?',
                    [is_favorited, id]
                );
                return res.status(200).json({ success: true, message: 'Fornecedor atualizado com sucesso.' });
            }

            // DELETE: Delete a supplier
            if (req.method === 'DELETE') {
                const { id } = req.body;
                if (!id) {
                    return res.status(400).json({ success: false, message: 'ID do fornecedor é obrigatório.' });
                }
                await connection.execute('DELETE FROM suppliers WHERE id = ?', [id]);
                return res.status(200).json({ success: true, message: 'Fornecedor apagado com sucesso.' });
            }

            return res.status(405).json({ success: false, message: 'Method Not Allowed' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('API Error in suppliers.js:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
};
