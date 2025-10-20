import { db, runMigrations, runSeeds } from './src/config/database.js';
import logger from './src/config/logger.js';

async function setupDatabase() {
  try {
    logger.info('🔄 Iniciando configuração do banco de dados...');

    // Executar migrações
    logger.info('📋 Executando migrações...');
    await runMigrations();
    logger.info('✅ Migrações executadas com sucesso');

    // Executar seeds
    logger.info('🌱 Executando seeds...');
    await runSeeds();
    logger.info('✅ Seeds executados com sucesso');

    logger.info('🎉 Banco de dados configurado com sucesso!');
    
    // Fechar conexão
    await db.destroy();
    process.exit(0);

  } catch (error) {
    logger.error('❌ Erro ao configurar banco de dados:', error);
    await db.destroy();
    process.exit(1);
  }
}

setupDatabase();
