
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
            // 1. Buscar configuração da API
            const [rows] = await connection.execute('SELECT * FROM quick_order_configs WHERE id = ?', [config_id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Configuração de serviço não encontrada.' });
            }
            config = rows[0];

            // 2. Construir URL da API Externa
            const params = new URLSearchParams();
            params.append('key', config.api_key);
            params.append('action', 'add');
            params.append('service', config.service_id);
            params.append('link', link);
            params.append('quantity', quantity);

            // 3. Executar pedido externo
            const externalResponse = await fetch(`${config.api_url}?${params.toString()}`, {
                method: 'POST',
            });

            const data = await externalResponse.json();

            if (data.error) {
                return res.status(400).json({ success: false, message: `Erro da API Externa: ${data.error}` });
            }

            // 4. Se sucesso, atualizar status local automaticamente
            if (data.order) {
                // Atualiza TODOS os pedidos locais que tenham o mesmo link e ainda não estejam 'Iniciado' (opcional) ou força 'Iniciado'
                await connection.execute(
                    "UPDATE orders SET progress_status = 'Iniciado' WHERE link = ?",
                    [link]
                );

                return res.status(200).json({ 
                    success: true, 
                    message: `Pedido realizado com sucesso! ID Externo: ${data.order}. Status local atualizado.`,
                    external_order_id: data.order 
                });
            }

            return res.status(200).json({ success: true, message: 'Pedido enviado.', data: data });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Execute Quick Order Error:', error);
        return res.status(500).json({ success: false, message: 'Erro ao comunicar com o fornecedor externo.' });
    }
};
