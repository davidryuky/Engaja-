
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
        
        // Insert default values if they don't exist
        // WhatsApp default
        await connection.execute(`
            INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('whatsapp_number', '818075997250')
        `);
        // Exit Intent default (enabled by default 'true')
        await connection.execute(`
            INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('exit_intent_enabled', 'true')
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
        await ensureDbInitialized();
        const connection = await getPool().getConnection();

        try {
            // GET: Fetch all settings
            if (req.method === 'GET') {
                const [rows] = await connection.execute("SELECT * FROM settings");
                
                // Convert array of rows to a single object { key: value }
                const settings = rows.reduce((acc, row) => {
                    acc[row.setting_key] = row.setting_value;
                    return acc;
                }, {});
                
                return res.status(200).json({ success: true, settings });
            }

            // PUT: Update settings (can accept multiple keys)
            if (req.method === 'PUT') {
                const updates = req.body; // Expect object like { whatsapp_number: '...', exit_intent_enabled: '...' }
                
                if (!updates || Object.keys(updates).length === 0) {
                    return res.status(400).json({ success: false, message: 'Nenhum dado para atualizar.' });
                }

                const keys = Object.keys(updates);
                
                // Process updates in parallel
                await Promise.all(keys.map(key => {
                    const value = String(updates[key]); // Ensure it's a string
                    return connection.execute(
                        `INSERT INTO settings (setting_key, setting_value) 
                         VALUES (?, ?) 
                         ON DUPLICATE KEY UPDATE setting_value = ?`,
                        [key, value, value]
                    );
                }));
                
                return res.status(200).json({ success: true, message: 'Configurações salvas com sucesso.' });
            }

            return res.status(405).json({ success: false, message: 'Method Not Allowed' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('API Error in settings.js:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
};
