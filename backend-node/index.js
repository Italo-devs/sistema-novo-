require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Importar rotas
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8001;

// ============= Middlewares =============

// CORS - Permitir requisições do frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parser de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============= Rotas =============

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'VipBarbeiro API - Backend Node.js',
    version: '1.0.0',
    status: 'online',
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// ============= Error Handlers =============

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    detail: `A rota ${req.method} ${req.path} não existe`,
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    detail: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ============= Inicialização =============

async function startServer() {
  try {
    // Conectar ao MongoDB
    await connectDB();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════');
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ MongoDB: Conectado`);
      console.log('═══════════════════════════════════════════════');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

// Iniciar
startServer();
