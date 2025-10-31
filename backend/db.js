import mysql from 'mysql2/promise';

// Cria um pool de conexões, que é mais eficiente para gerenciar múltiplas conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log("Successfully connected to the database.");
    conn.release();
  })
  .catch(err => {
    console.error("Failed to connect to the database. Please check your .env file and database credentials.");
    console.error(err.message);
    // process.exit(1); // Descomente para encerrar o app se não conseguir conectar
  });


export default pool;
