// api/financials.js
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

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
    
    try {
        const connection = await pool.getConnection();
        try {
            // More efficient query to get all counts at once
            const [[stats]] = await connection.execute(`
                SELECT 
                    COUNT(*) as totalOrders,
                    SUM(CASE WHEN payment_status = 'Pago' THEN 1 ELSE 0 END) as paidOrders,
                    SUM(CASE WHEN payment_status = 'Aguardando Pagamento' THEN 1 ELSE 0 END) as pendingOrders
                FROM orders
            `);

            const [ordersByPlatform] = await connection.execute(`
                SELECT platform, COUNT(*) as count 
                FROM orders 
                GROUP BY platform 
                ORDER BY count DESC
            `);

            res.status(200).json({
                success: true,
                stats: {
                    totalOrders: stats.totalOrders || 0,
                    paidOrders: stats.paidOrders || 0,
                    pendingOrders: stats.pendingOrders || 0,
                    ordersByPlatform: ordersByPlatform
                }
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Financials API Error:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
};
