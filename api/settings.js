// api/settings.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function initializeDatabase() {
    const connection = await pool.getConnection();
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(255) NOT NULL UNIQUE,
                setting_value TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
    } finally {
        connection.release();
    }
}

let dbInitialized = false;
async function ensureDbInitialized() {
    if (!dbInitialized) {
        await initializeDatabase();
        dbInitialized = true;
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        await ensureDbInitialized();
    } catch (dbError) {
        console.error('Database Initialization Error (settings):', dbError);
        return res.status(500).json({ success: false, message: 'Falha crítica ao inicializar o banco de dados.' });
    }

    try {
        const connection = await pool.getConnection();
        try {
            if (req.method === 'GET') {
                const { key } = req.query;
                if (!key) {
                    return res.status(400).json({ success: false, message: 'Setting key is required.' });
                }

                const [rows] = await connection.execute('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
                
                if (rows.length > 0) {
                    return res.status(200).json({ success: true, value: rows[0].setting_value });
                } else {
                    // Return a default value if the key is not found
                    if (key === 'whatsapp_number') {
                        return res.status(200).json({ success: true, value: '818075997250' });
                    }
                    return res.status(404).json({ success: false, message: 'Setting not found.' });
                }
            }

            if (req.method === 'PUT') {
                const { key, value } = req.body;
                 if (!key || value === undefined) {
                    return res.status(400).json({ success: false, message: 'Setting key and value are required.' });
                }

                const sql = `
                    INSERT INTO settings (setting_key, setting_value)
                    VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
                `;

                await connection.execute(sql, [key, value]);
                return res.status(200).json({ success: true, message: 'Setting updated successfully.' });
            }

            return res.status(405).json({ success: false, message: 'Method Not Allowed' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('API Error in settings.js:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};