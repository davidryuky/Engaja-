const mysql = require('mysql2/promise');
const { customAlphabet } = require('nanoid');

// Database connection pool (reuse from login if possible, but for serverless it's safer to define here)
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
                public_id VARCHAR(10) NOT NULL UNIQUE,
                platform VARCHAR(255) NOT NULL,
                service VARCHAR(255) NOT NULL,
                link TEXT NOT NULL,
                quantity INT,
                comments TEXT,
                status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
                notes TEXT,
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
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Ensure DB is ready
    try {
        await ensureDbInitialized();
    } catch (dbError) {
        console.error('Database Initialization Error:', dbError);
        return res.status(500).json({ success: false, message: 'Falha crítica ao inicializar o banco de dados.' });
    }

    // --- ROUTING ---
    if (req.method === 'POST') {
        return handlePost(req, res);
    }
    if (req.method === 'GET') {
        return handleGet(req, res);
    }
    if (req.method === 'PUT') {
        return handlePut(req, res);
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
};


// --- HANDLERS ---

async function handlePost(req, res) {
    try {
        const { platform, service, link, quantity, comments } = req.body;

        if (!platform || !service || !link) {
            return res.status(400).json({ success: false, message: 'Plataforma, serviço e link são obrigatórios.' });
        }
        
        // Generate a unique, URL-friendly public ID
        const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
        const publicId = nanoid();

        const connection = await pool.getConnection();
        try {
            await connection.execute(
                'INSERT INTO orders (public_id, platform, service, link, quantity, comments) VALUES (?, ?, ?, ?, ?, ?)',
                [publicId, platform, service, link, quantity || null, comments || null]
            );
            return res.status(201).json({ success: true, message: 'Pedido criado com sucesso.', publicId });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('API POST Error:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
}


async function handleGet(req, res) {
     try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM orders ORDER BY created_at DESC');
            return res.status(200).json({ success: true, orders: rows });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('API GET Error:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
}


async function handlePut(req, res) {
    try {
        const { id } = req.query; // Get ID from query parameter
        const { status, notes } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: 'ID do pedido é obrigatório.' });
        }
        
        const updates = [];
        const values = [];
        
        if (status) {
            updates.push('status = ?');
            values.push(status);
        }
        if (notes !== undefined) { // Allow empty string for notes
            updates.push('notes = ?');
            values.push(notes);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar foi fornecido.' });
        }

        values.push(id); // Add ID for the WHERE clause
        
        const connection = await pool.getConnection();
        try {
            const sql = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`;
            const [result] = await connection.execute(sql, values);
            
            if (result.affectedRows === 0) {
                 return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });
            }

            return res.status(200).json({ success: true, message: 'Pedido atualizado com sucesso.' });
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('API PUT Error:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
}
