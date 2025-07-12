import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Middlewares personalizados
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { authMiddleware } from './middlewares/auth.js';

// Rotas
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import workspaceRoutes from './routes/workspaces.js';
import boardRoutes from './routes/boards.js';
import listRoutes from './routes/lists.js';
import cardRoutes from './routes/cards.js';
import labelRoutes from './routes/labels.js';
import commentRoutes from './routes/comments.js';
import activityRoutes from './routes/activities.js';
import uploadRoutes from './routes/upload.js';

// Configurações
import logger from './config/logger.js';
import sqlite from './config/sqlite.js';

dotenv.config();

// ========================================
// CONFIGURAÇÃO DA APLICAÇÃO
// ========================================

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// Segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas requisições deste IP, tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// ========================================
// WEBSOCKET CONFIGURATION
// ========================================

const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware de autenticação para Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    // Verificar token JWT aqui
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

// Eventos do Socket.IO
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join room por workspace
  socket.on('join-workspace', (workspaceId) => {
    socket.join(`workspace-${workspaceId}`);
    logger.info(`User ${socket.id} joined workspace ${workspaceId}`);
  });

  // Join room por board
  socket.on('join-board', (boardId) => {
    socket.join(`board-${boardId}`);
    logger.info(`User ${socket.id} joined board ${boardId}`);
  });

  // Eventos de cards
  socket.on('card-moved', (data) => {
    socket.to(`board-${data.boardId}`).emit('card-moved', data);
  });

  socket.on('card-updated', (data) => {
    socket.to(`board-${data.boardId}`).emit('card-updated', data);
  });

  // Chat em tempo real
  socket.on('chat-message', (data) => {
    socket.to(`workspace-${data.workspaceId}`).emit('chat-message', data);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Tornar io disponível em toda a aplicação
app.set('io', io);

// ========================================
// ROTAS DA API
// ========================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

// Rotas da API
const apiRouter = express.Router();

// Rotas públicas
apiRouter.use('/auth', authRoutes);

// Rotas protegidas
apiRouter.use('/users', authMiddleware, userRoutes);
apiRouter.use('/workspaces', authMiddleware, workspaceRoutes);
apiRouter.use('/boards', authMiddleware, boardRoutes);
apiRouter.use('/lists', authMiddleware, listRoutes);
apiRouter.use('/cards', authMiddleware, cardRoutes);
apiRouter.use('/labels', authMiddleware, labelRoutes);
apiRouter.use('/comments', authMiddleware, commentRoutes);
apiRouter.use('/activities', authMiddleware, activityRoutes);
apiRouter.use('/upload', authMiddleware, uploadRoutes);

app.use('/api/v1', apiRouter);

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// ========================================
// MIDDLEWARES DE ERRO
// ========================================

app.use(notFound);
app.use(errorHandler);

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

async function startServer() {
  try {
    // Conectar ao banco de dados
    if (process.env.DB_TYPE === 'sqlite') {
      sqlite.connect();
      logger.info('✅ SQLite database connected successfully');
    } else {
      const { connectDatabase } = await import('./config/database.js');
      await connectDatabase();
      logger.info('✅ PostgreSQL database connected successfully');
    }

    // Iniciar servidor
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📖 API Documentation: http://localhost:${PORT}/api/v1`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🗄️ Database: ${process.env.DB_TYPE || 'postgresql'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

function gracefulShutdown(signal) {
  logger.info(`🛑 Received ${signal}, shutting down gracefully...`);
  
  server.close(() => {
    logger.info('✅ HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Iniciar servidor
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
