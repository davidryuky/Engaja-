
// api/settings.js
const mysql = require('mysql2/promise');

// Use lazy initialization for the connection pool
let pool;

function getPool() {
    if (!pool) {
        // This will only be created once per server instance
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

// Function to initialize the database
async function initializeDatabase() {
    const connection = await getPool().getConnection();
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS settings (
                setting_key VARCHAR(255) PRIMARY KEY,
                setting_value TEXT NOT NULL
            )
        `);
        // Insert a default value if it doesn't exist, without overwriting
        await connection.execute(`
            INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('whatsapp_number', '818075997250')
        `);
    } finally {
        connection.release();
    }
}

// Ensure the database is initialized only once
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Ensure DB is ready before proceeding. This is now safe.
        await ensureDbInitialized();
        const connection = await getPool().getConnection();

        try {
            // GET: Fetch a setting
            if (req.method === 'GET') {
                const [[row]] = await connection.execute(
                    "SELECT setting_value FROM settings WHERE setting_key = 'whatsapp_number'"
                );
                
                if (row) {
                    return res.status(200).json({ success: true, value: row.setting_value });
                } else {
                    return res.status(404).json({ success: false, message: 'Configuração não encontrada.' });
                }
            }

            // PUT: Update a setting
            if (req.method === 'PUT') {
                const { number } = req.body;
                if (number === undefined) {
                    return res.status(400).json({ success: false, message: 'O número é obrigatório.' });
                }

                // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both new and existing settings
                await connection.execute(
                    `INSERT INTO settings (setting_key, setting_value) 
                     VALUES ('whatsapp_number', ?) 
                     ON DUPLICATE KEY UPDATE setting_value = ?`,
                    [number, number]
                );
                
                return res.status(200).json({ success: true, message: 'Configuração salva com sucesso.' });
            }

            return res.status(405).json({ success: false, message: 'Method Not Allowed' });
        } finally {
            connection.release();
        }
    } catch (error) {
        // This will catch critical errors like failed DB connection
        console.error('API Error in settings.js:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor. Verifique as credenciais do banco de dados.' });
    }
};
