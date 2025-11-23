
// api/quick_order_configs.js
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
});

async function initializeDatabase() {
    const connection = await pool.getConnection();
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS quick_order_configs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                api_url VARCHAR(255) NOT NULL DEFAULT 'https://smmflare.com/api/v2',
                api_key VARCHAR(255) NOT NULL,
                service_id VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    
    await ensureDbInitialized();

    try {
        const connection = await pool.getConnection();
        try {
            // GET: Listar configs
            if (req.method === 'GET') {
                const [rows] = await connection.execute('SELECT id, name, api_url, service_id FROM quick_order_configs ORDER BY name ASC');
                // Não retornamos a api_key por segurança na listagem, apenas se estritamente necessário
                return res.status(200).json({ success: true, configs: rows });
            }

            // POST: Criar config
            if (req.method === 'POST') {
                const { name, api_url, api_key, service_id } = req.body;
                if (!name || !api_key || !service_id) {
                    return res.status(400).json({ success: false, message: 'Preencha todos os campos obrigatórios.' });
                }
                const urlToUse = api_url || 'https://smmflare.com/api/v2';

                await connection.execute(
                    'INSERT INTO quick_order_configs (name, api_url, api_key, service_id) VALUES (?, ?, ?, ?)',
                    [name, urlToUse, api_key, service_id]
                );
                return res.status(201).json({ success: true, message: 'Configuração salva com sucesso.' });
            }

            // DELETE: Remover config
            if (req.method === 'DELETE') {
                const { id } = req.body;
                if (!id) return res.status(400).json({ success: false, message: 'ID obrigatório.' });
                
                await connection.execute('DELETE FROM quick_order_configs WHERE id = ?', [id]);
                return res.status(200).json({ success: true, message: 'Configuração removida.' });
            }

            return res.status(405).json({ success: false, message: 'Method Not Allowed' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('API Quick Order Config Error:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
};
