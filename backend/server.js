import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';

// Configura o caminho para o arquivo .env na raiz do projeto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });


const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permite requisições de origens diferentes (do seu frontend para o backend)
app.use(express.json()); // Permite que o servidor entenda JSON no corpo das requisições

// Rotas da API
app.use('/api', authRoutes);

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
