
// api/orders.js

const mysql = require('mysql2/promise');

// Use lazy initialization for the connection pool
let pool;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }
    return pool;
}

// Helper function to generate a random alphanumeric public ID
function generatePublicId() {
    const prefix = 'EG';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + result;
}


// Function to initialize the database (create table and ensure columns exist)
async function initializeDatabase() {
    const connection = await getPool().getConnection();
    try {
        // Create the table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                public_id VARCHAR(10) NOT NULL UNIQUE,
                platform VARCHAR(255) NOT NULL,
                service VARCHAR(255) NOT NULL,
                link TEXT NOT NULL,
                quantity INT,
                comments TEXT,
                payment_status ENUM('Aguardando Pagamento', 'Pago') NOT NULL DEFAULT 'Aguardando Pagamento',
                progress_status ENUM('Parado', 'Iniciado') NOT NULL DEFAULT 'Parado',
                completion_status ENUM('Incompleto', 'Concluido') NOT NULL DEFAULT 'Incompleto',
                problem_status ENUM('Normal', 'Problema') NOT NULL DEFAULT 'Normal',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Schema Migration: Check for new columns and add them if missing
        
        // 1. Check for 'notes'
        const [notesColumns] = await connection.execute(
            `SHOW COLUMNS FROM orders LIKE 'notes'`
        );
        if (notesColumns.length === 0) {
            await connection.execute(
                `ALTER TABLE orders ADD COLUMN notes TEXT`
            );
        }

        // 2. Check for 'problem_status'
        const [problemColumns] = await connection.execute(
            `SHOW COLUMNS FROM orders LIKE 'problem_status'`
        );
        if (problemColumns.length === 0) {
            await connection.execute(
                `ALTER TABLE orders ADD COLUMN problem_status ENUM('Normal', 'Problema') NOT NULL DEFAULT 'Normal'`
            );
        }

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
        const connection = await getPool().getConnection();

        try {
            // --- GET: Fetch all orders for the dashboard with pagination and filtering ---
            if (req.method === 'GET') {
                const page = parseInt(req.query.page, 10) || 1;
                // Allow custom limit via query. Default 10, allow up to 500 for analytics
                let limit = parseInt(req.query.limit, 10) || 10;
                if (limit > 500) limit = 500;

                const { payment_status, progress_status, completion_status, problem_status, search } = req.query;

                const offset = (page - 1) * limit;

                let whereClauses = [];
                let queryParams = [];

                if (payment_status && payment_status !== 'all') {
                    whereClauses.push('payment_status = ?');
                    queryParams.push(payment_status);
                }
                if (progress_status && progress_status !== 'all') {
                    whereClauses.push('progress_status = ?');
                    queryParams.push(progress_status);
                }
                if (completion_status && completion_status !== 'all') {
                    whereClauses.push('completion_status = ?');
                    queryParams.push(completion_status);
                }
                if (problem_status && problem_status !== 'all') {
                    whereClauses.push('problem_status = ?');
                    queryParams.push(problem_status);
                }

                // Search functionality
                if (search) {
                    whereClauses.push('(public_id LIKE ? OR link LIKE ?)');
                    const searchParam = `%${search}%`;
                    queryParams.push(searchParam, searchParam);
                }

                const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

                // Get the total count of filtered orders
                const countSql = `SELECT COUNT(*) as total FROM orders ${whereString}`;
                const [[{ total }]] = await connection.execute(countSql, queryParams);
                const totalPages = Math.ceil(total / limit);

                // Get the paginated and filtered orders
                const selectSql = `SELECT * FROM orders ${whereString} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
                const [rows] = await connection.execute(selectSql, [...queryParams, limit, offset]);


                return res.status(200).json({ 
                    success: true, 
                    orders: rows,
                    totalPages: totalPages,
                    currentPage: page,
                    totalOrders: total
                });
            }

            // --- POST: Create a new order ---
            if (req.method === 'POST') {
                const { platform, service, link, quantity, comments } = req.body;
                
                if (!platform || !service || !link) {
                    return res.status(400).json({ success: false, message: 'Dados do pedido incompletos.' });
                }

                let publicId;
                let success = false;
                const maxRetries = 10; // Prevent infinite loops

                for (let i = 0; i < maxRetries; i++) {
                    try {
                        publicId = generatePublicId();
                        await connection.execute(
                            'INSERT INTO orders (public_id, platform, service, link, quantity, comments) VALUES (?, ?, ?, ?, ?, ?)',
                            [publicId, platform, service, link, quantity || null, comments || null]
                        );
                        success = true; // If insert is successful, we're done
                        break; // Exit the loop
                    } catch (error) {
                        // Check if it's a duplicate entry error (code for mysql/mysql2)
                        if (error.code === 'ER_DUP_ENTRY') {
                            // If so, the loop will continue and try with a new ID
                            console.warn(`Collision detected for public_id ${publicId}. Retrying...`);
                            continue;
                        }
                        // For any other error, re-throw it to be caught by the outer handler
                        throw error;
                    }
                }

                if (success) {
                    return res.status(201).json({ success: true, message: 'Pedido criado com sucesso.', publicId: publicId });
                } else {
                    // If the loop finished without a successful insert
                    console.error(`Failed to generate a unique public_id after ${maxRetries} attempts.`);
                    return res.status(500).json({ success: false, message: 'Não foi possível gerar um ID único para o pedido. Tente novamente.' });
                }
            }
            
            // --- PUT: Update an order's status or notes ---
            if (req.method === 'PUT') {
                const { orderId, statusType, newStatus, notes } = req.body;
                
                if (!orderId) {
                    return res.status(400).json({ success: false, message: 'ID do pedido é obrigatório.' });
                }

                // Handle status update
                if (statusType && newStatus) {
                    const validStatusTypes = ['payment_status', 'progress_status', 'completion_status', 'problem_status'];
                    if (!validStatusTypes.includes(statusType)) {
                        return res.status(400).json({ success: false, message: 'Tipo de status inválido.' });
                    }
                    const sql = `UPDATE orders SET ${statusType} = ? WHERE id = ?`;
                    await connection.execute(sql, [newStatus, orderId]);
                    return res.status(200).json({ success: true, message: 'Status do pedido atualizado com sucesso.' });
                } 
                // Handle notes update
                else if (notes !== undefined) {
                    const sql = `UPDATE orders SET notes = ? WHERE id = ?`;
                    await connection.execute(sql, [notes, orderId]);
                    return res.status(200).json({ success: true, message: 'Anotações salvas com sucesso.' });
                }
                // If neither condition is met
                else {
                    return res.status(400).json({ success: false, message: 'Dados de atualização insuficientes.' });
                }
            }


            // --- DELETE: Delete an order ---
            if (req.method === 'DELETE') {
                const { orderId } = req.body;

                if (!orderId) {
                    return res.status(400).json({ success: false, message: 'ID do pedido é obrigatório.' });
                }

                await connection.execute('DELETE FROM orders WHERE id = ?', [orderId]);

                return res.status(200).json({ success: true, message: 'Pedido apagado com sucesso.' });
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
