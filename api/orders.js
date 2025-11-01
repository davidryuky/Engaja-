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
    queueLimit: 0,
    // Add SSL configuration for secure connections if required by your provider
    // ssl: {
    //   rejectUnauthorized: true 
    // }
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
                payment_status VARCHAR(50) DEFAULT 'Aguardando Pagamento',
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

function generatePublicId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'EG';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        await ensureDbInitialized();
    } catch (dbError) {
        console.error('Database Initialization Error:', dbError);
        return res.status(500).json({ success: false, message: 'Falha crítica ao inicializar o banco de dados.' });
    }

    const connection = await pool.getConnection();

    try {
        if (req.method === 'GET') {
            const [orders] = await connection.execute('SELECT * FROM orders ORDER BY created_at DESC');
            return res.status(200).json({ success: true, orders });
        }

        if (req.method === 'POST') {
            const { platform, service, link, quantity, comments } = req.body;

            if (!platform || !service || !link) {
                return res.status(400).json({ success: false, message: 'Campos obrigatórios ausentes.' });
            }

            let publicId;
            let inserted = false;
            let attempts = 0;
            const maxAttempts = 10;

            while (!inserted && attempts < maxAttempts) {
                publicId = generatePublicId();
                try {
                    await connection.execute(
                        'INSERT INTO orders (public_id, platform, service, link, quantity, comments, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [publicId, platform, service, link, quantity || null, comments || null, 'Aguardando Pagamento']
                    );
                    inserted = true;
                } catch (error) {
                    // ER_DUP_ENTRY is the error code for a duplicate unique key
                    if (error.code === 'ER_DUP_ENTRY') {
                        attempts++;
                        console.warn(`Collision detected for public_id ${publicId}. Retrying... Attempt ${attempts}`);
                    } else {
                        throw error; // Re-throw other errors
                    }
                }
            }
            
            if (!inserted) {
                 throw new Error('Não foi possível gerar um ID de pedido único após várias tentativas.');
            }

            return res.status(201).json({ success: true, publicId });
        }
        
        if (req.method === 'PUT') {
            const { id, payment_status } = req.body;
            if (!id || !payment_status) {
                 return res.status(400).json({ success: false, message: 'ID e status são obrigatórios.' });
            }
            
            await connection.execute('UPDATE orders SET payment_status = ? WHERE id = ?', [payment_status, id]);
            return res.status(200).json({ success: true, message: 'Status atualizado com sucesso.' });
        }


        // If method is not handled
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
};
