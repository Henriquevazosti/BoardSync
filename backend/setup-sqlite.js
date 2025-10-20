#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite from './src/config/sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configurando BoardSync com SQLite...\n');

async function setupSQLite() {
  try {
    // Criar diretórios necessários
    const dirs = ['logs', 'uploads', 'database'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Diretório ${dir}/ criado`);
      }
    });

    // Criar arquivo .env para SQLite
    const envPath = '.env.sqlite';
    const envContent = `NODE_ENV=development
PORT=3001
DB_TYPE=sqlite
DB_PATH=./database/boardsync.db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
SESSION_SECRET=your_super_secret_session_key_change_this_too
UPLOAD_PATH=./uploads
LOG_LEVEL=debug
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env.sqlite criado');

    // Conectar e inicializar banco SQLite
    console.log('📄 Inicializando banco SQLite...');
    const db = sqlite.connect();
    sqlite.initSchema();
    
    // Testar conexão
    const isHealthy = sqlite.healthCheck();
    if (isHealthy) {
      console.log('✅ Banco SQLite inicializado com sucesso');
      console.log('✅ Dados de exemplo inseridos');
    } else {
      throw new Error('Falha no health check');
    }

    sqlite.close();

    console.log('\n🎉 Configuração SQLite concluída!');
    console.log('\n🚀 Para iniciar o servidor:');
    console.log('   npm run dev:sqlite');
    console.log('\n🧪 Para testar a API:');
    console.log('   DB_TYPE=sqlite npm run test:api');
    console.log('\n📁 Banco de dados criado em: ./database/boardsync.db');
    console.log('\n👤 Login padrão:');
    console.log('   Email: admin@boardsync.com');
    console.log('   Senha: password');

  } catch (error) {
    console.error('❌ Erro na configuração SQLite:', error.message);
    process.exit(1);
  }
}

setupSQLite();
