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
    // Add SSL support for secure connections if required by your provider
    // ssl: {
    //   rejectUnauthorized: true
    // }
});

// Function to initialize the database (create table if not exists)
async function initializeDatabase() {
    const connection = await pool.getConnection();
    try {
        // Drop the table if it exists to ensure a fresh start as requested
        await connection.execute(`DROP TABLE IF EXISTS orders`);

        // Create the new, detailed orders table
        await connection.execute(`
            CREATE TABLE orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                platform VARCHAR(255) NOT NULL,
                service VARCHAR(255) NOT NULL,
                link TEXT NOT NULL,
                quantity INT,
                comments TEXT,
                payment_status ENUM('Aguardando Pagamento', 'Pago') NOT NULL DEFAULT 'Aguardando Pagamento',
                progress_status ENUM('Parado', 'Iniciado') NOT NULL DEFAULT 'Parado',
                completion_status ENUM('Incompleto', 'Concluido') NOT NULL DEFAULT 'Incompleto',
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
    
    // Ensure DB is ready before proceeding
    try {
        await ensureDbInitialized();
    } catch (dbError) {
        console.error('Database Initialization Error:', dbError);
        return res.status(500).json({ success: false, message: 'Falha crítica ao inicializar o banco de dados.' });
    }


    try {
        const connection = await pool.getConnection();

        try {
            // --- GET: Fetch all orders for the dashboard ---
            if (req.method === 'GET') {
                const [rows] = await connection.execute('SELECT * FROM orders ORDER BY created_at DESC');
                return res.status(200).json({ success: true, orders: rows });
            }

            // --- POST: Create a new order ---
            if (req.method === 'POST') {
                const { platform, service, link, quantity, comments } = req.body;
                
                if (!platform || !service || !link) {
                    return res.status(400).json({ success: false, message: 'Dados do pedido incompletos.' });
                }

                const [result] = await connection.execute(
                    'INSERT INTO orders (platform, service, link, quantity, comments) VALUES (?, ?, ?, ?, ?)',
                    [platform, service, link, quantity || null, comments || null]
                );
                
                return res.status(201).json({ success: true, message: 'Pedido criado com sucesso.', orderId: result.insertId });
            }
            
            // --- PUT: Update an order's status ---
            if (req.method === 'PUT') {
                const { orderId, statusType, newStatus } = req.body;
                
                if (!orderId || !statusType || !newStatus) {
                    return res.status(400).json({ success: false, message: 'Dados de atualização insuficientes.' });
                }

                // Whitelist status types to prevent SQL injection
                const validStatusTypes = ['payment_status', 'progress_status', 'completion_status'];
                if (!validStatusTypes.includes(statusType)) {
                    return res.status(400).json({ success: false, message: 'Tipo de status inválido.' });
                }
                
                const sql = `UPDATE orders SET ${statusType} = ? WHERE id = ?`;
                await connection.execute(sql, [newStatus, orderId]);

                return res.status(200).json({ success: true, message: 'Status do pedido atualizado com sucesso.' });
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
