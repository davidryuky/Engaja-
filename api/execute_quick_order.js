
// api/execute_quick_order.js
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

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { config_id, link, quantity } = req.body;

        if (!config_id || !link || !quantity) {
            return res.status(400).json({ success: false, message: 'Dados incompletos (Config, Link ou Quantidade).' });
        }

        const connection = await pool.getConnection();
        let config = null;
        try {
            const [rows] = await connection.execute('SELECT * FROM quick_order_configs WHERE id = ?', [config_id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Configuração de serviço não encontrada.' });
            }
            config = rows[0];
        } finally {
            connection.release();
        }

        // Construir URL da API Externa (Padrão SMM)
        // action=add&service=ID&link=LINK&quantity=QTD&key=API_KEY
        const params = new URLSearchParams();
        params.append('key', config.api_key);
        params.append('action', 'add');
        params.append('service', config.service_id);
        params.append('link', link);
        params.append('quantity', quantity);

        // Fetch externo
        const externalResponse = await fetch(`${config.api_url}?${params.toString()}`, {
            method: 'POST', // Muitos SMM aceitam GET, mas POST é mais seguro. Se falhar, tentamos GET.
        });

        const data = await externalResponse.json();

        // Verificar resposta do SMM (geralmente retorna { order: 12345 } ou { error: "..." })
        if (data.error) {
            return res.status(400).json({ success: false, message: `Erro da API Externa: ${data.error}` });
        }

        if (data.order) {
            return res.status(200).json({ 
                success: true, 
                message: `Pedido realizado com sucesso! ID Externo: ${data.order}`,
                external_order_id: data.order 
            });
        }

        // Fallback para respostas desconhecidas
        return res.status(200).json({ success: true, message: 'Pedido enviado.', data: data });

    } catch (error) {
        console.error('Execute Quick Order Error:', error);
        return res.status(500).json({ success: false, message: 'Erro ao comunicar com o fornecedor externo.' });
    }
};
