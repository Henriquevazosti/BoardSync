import knex from 'knex';
import logger from './logger.js';

let db = null;

// ========================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ========================================

// Função para conectar e testar a conexão
export async function connectDatabase() {
  try {
    if (!db) {
      const knexConfig = await import('../../knexfile.js');
      const environment = process.env.NODE_ENV || 'development';
      const config = knexConfig.default[environment];
      db = knex(config);
    }
    
    // Testar conexão
    await db.raw('SELECT 1+1 as result');
    
    // Executar migrações se necessário
    if (process.env.AUTO_MIGRATE === 'true') {
      logger.info('🔄 Running database migrations...');
      await db.migrate.latest();
      logger.info('✅ Database migrations completed');
    }

    return db;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Função para fechar conexão
export async function disconnectDatabase() {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
    logger.info('🔌 Database connection closed');
  }
}

// ========================================
// QUERY BUILDERS UTILITÁRIOS
// ========================================

// Query builder para paginação
export function paginate(query, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  return query.limit(limit).offset(offset);
}

// Query builder para soft delete
export function withoutDeleted(query) {
  return query.whereNull('deleted_at');
}

// Query builder para ordenação
export function orderBy(query, sort = 'created_at', direction = 'desc') {
  return query.orderBy(sort, direction);
}

// ========================================
// TRANSAÇÕES
// ========================================

export async function transaction(callback) {
  const database = await getDatabase();
  return database.transaction(callback);
}

// ========================================
// MIGRAÇÕES E SEEDS
// ========================================

// Executar migrações
export async function runMigrations() {
  try {
    logger.info('🔄 Executando migrações...');
    const database = await getDatabase();
    await database.migrate.latest();
    logger.info('✅ Migrações executadas com sucesso');
  } catch (error) {
    logger.error('❌ Erro ao executar migrações:', error);
    throw error;
  }
}

// Executar seeds
export async function runSeeds() {
  try {
    logger.info('🌱 Executando seeds...');
    const database = await getDatabase();
    await database.seed.run();
    logger.info('✅ Seeds executados com sucesso');
  } catch (error) {
    logger.error('❌ Erro ao executar seeds:', error);
    throw error;
  }
}

// Verificar saúde do banco
export async function checkDatabaseHealth() {
  try {
    const database = await getDatabase();
    
    // Teste básico de conexão
    const result = await database.raw('SELECT NOW() as timestamp, version() as version');
    
    // Verificar se tabelas principais existem
    const tables = await database.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'workspaces', 'boards', 'cards')
    `);
    
    return {
      status: 'healthy',
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version,
      tables: tables.rows.map(row => row.table_name)
    };
  } catch (error) {
    logger.error('❌ Erro na verificação de saúde do banco:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

// Função para obter a instância do banco de dados
export async function getDatabase() {
  if (!dbInstance) {
    dbInstance = await connectToDatabase();
  }
  return dbInstance;
}

// Para compatibilidade com código que usa import db from './database.js'
export { getDatabase as default };
