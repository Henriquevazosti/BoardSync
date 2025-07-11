import knex from 'knex';
import knexConfig from '../../knexfile.js';
import logger from './logger.js';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// ========================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ========================================

export const db = knex(config);

// Função para conectar e testar a conexão
export async function connectDatabase() {
  try {
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
  await db.destroy();
  logger.info('🔌 Database connection closed');
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
  return db.transaction(callback);
}

// ========================================
// MIGRAÇÕES E SEEDS
// ========================================

// Executar migrações
export async function runMigrations() {
  try {
    logger.info('🔄 Executando migrações...');
    await db.migrate.latest();
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
    await db.seed.run();
    logger.info('✅ Seeds executados com sucesso');
  } catch (error) {
    logger.error('❌ Erro ao executar seeds:', error);
    throw error;
  }
}

// Verificar saúde do banco
export async function checkDatabaseHealth() {
  try {
    // Teste básico de conexão
    const result = await db.raw('SELECT NOW() as timestamp, version() as version');
    
    // Verificar se tabelas principais existem
    const tables = await db.raw(`
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

export default db;
