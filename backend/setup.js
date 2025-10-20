#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Configurando BoardSync Backend...\n');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkCommand(command) {
  try {
    await execAsync(`${command} --version`);
    return true;
  } catch (error) {
    return false;
  }
}

async function checkPostgreSQL() {
  log('🔍 Verificando PostgreSQL...', 'blue');
  
  const psqlExists = await checkCommand('psql');
  const pgExists = await checkCommand('pg_config');
  
  if (!psqlExists && !pgExists) {
    log('❌ PostgreSQL não encontrado!', 'red');
    log('   Por favor, instale o PostgreSQL:', 'yellow');
    log('   - Windows: https://www.postgresql.org/download/windows/');
    log('   - macOS: brew install postgresql');
    log('   - Ubuntu: sudo apt-get install postgresql');
    return false;
  }
  
  log('✅ PostgreSQL encontrado', 'green');
  return true;
}

async function createEnvFile() {
  log('📝 Configurando arquivo .env...', 'blue');
  
  try {
    // Verificar se .env já existe
    await fs.access('.env');
    log('⚠️  Arquivo .env já existe, pulando...', 'yellow');
    return;
  } catch (error) {
    // Arquivo não existe, criar
  }
  
  // Gerar JWT secret aleatório
  const jwtSecret = Buffer.from(Math.random().toString()).toString('base64').slice(0, 64);
  
  const envContent = `# ========================================
# CONFIGURAÇÕES DO AMBIENTE - BoardSync
# ========================================

# Servidor
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Base de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boardsync
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Autenticação
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Upload de arquivos
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf,text/plain
UPLOAD_DEST=uploads/

# URLs e CORS
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Logs
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Socket.IO
SOCKET_CORS_ORIGIN=http://localhost:3000

# Migrações automáticas
AUTO_MIGRATE=true
`;

  await fs.writeFile('.env', envContent);
  log('✅ Arquivo .env criado com sucesso', 'green');
}

async function createDatabase() {
  log('🗄️  Criando banco de dados...', 'blue');
  
  try {
    // Tentar criar o banco
    await execAsync('createdb boardsync');
    log('✅ Banco de dados "boardsync" criado', 'green');
  } catch (error) {
    if (error.stderr.includes('already exists')) {
      log('⚠️  Banco de dados já existe, pulando...', 'yellow');
    } else {
      log('❌ Erro ao criar banco de dados:', 'red');
      log(`   ${error.stderr}`, 'red');
      log('   Tente criar manualmente: createdb boardsync', 'yellow');
    }
  }
}

async function runSchema() {
  log('📋 Executando schema do banco...', 'blue');
  
  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    await execAsync(`psql -d boardsync -f "${schemaPath}"`);
    log('✅ Schema executado com sucesso', 'green');
  } catch (error) {
    log('❌ Erro ao executar schema:', 'red');
    log(`   ${error.stderr}`, 'red');
    log('   Tente executar manualmente: psql -d boardsync -f ../database/schema.sql', 'yellow');
  }
}

async function installDependencies() {
  log('📦 Verificando dependências...', 'blue');
  
  try {
    // Verificar se node_modules existe
    await fs.access('node_modules');
    log('✅ Dependências já instaladas', 'green');
  } catch (error) {
    log('📦 Instalando dependências...', 'blue');
    try {
      await execAsync('npm install');
      log('✅ Dependências instaladas com sucesso', 'green');
    } catch (installError) {
      log('❌ Erro ao instalar dependências:', 'red');
      log(`   ${installError.stderr}`, 'red');
      throw installError;
    }
  }
}

async function testConnection() {
  log('🔌 Testando conexão com banco...', 'blue');
  
  try {
    await execAsync('psql -d boardsync -c "SELECT NOW();"');
    log('✅ Conexão com banco funcionando', 'green');
    return true;
  } catch (error) {
    log('❌ Erro na conexão com banco:', 'red');
    log(`   ${error.stderr}`, 'red');
    return false;
  }
}

async function startServer() {
  log('🚀 Iniciando servidor de desenvolvimento...', 'blue');
  log('   Pressione Ctrl+C para parar o servidor', 'yellow');
  log('   API estará disponível em: http://localhost:3001', 'green');
  log('   Health check: http://localhost:3001/health', 'green');
  log('', 'reset');
  
  // Executar o servidor
  exec('npm run dev', (error, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    if (error) {
      log(`❌ Erro ao iniciar servidor: ${error.message}`, 'red');
    }
  });
}

async function main() {
  try {
    // 1. Verificar PostgreSQL
    const hasPostgres = await checkPostgreSQL();
    if (!hasPostgres) {
      process.exit(1);
    }
    
    // 2. Instalar dependências
    await installDependencies();
    
    // 3. Configurar .env
    await createEnvFile();
    
    // 4. Criar banco
    await createDatabase();
    
    // 5. Executar schema
    await runSchema();
    
    // 6. Testar conexão
    const connectionOk = await testConnection();
    if (!connectionOk) {
      log('❌ Falha na configuração do banco', 'red');
      process.exit(1);
    }
    
    log('\n🎉 Configuração concluída com sucesso!', 'green');
    log('📚 Próximos passos:', 'blue');
    log('   1. npm run dev - Iniciar servidor', 'yellow');
    log('   2. http://localhost:3001/health - Testar API', 'yellow');
    log('   3. Verificar logs em logs/combined.log', 'yellow');
    
    // Perguntar se quer iniciar o servidor
    log('\n🚀 Deseja iniciar o servidor agora? (será iniciado automaticamente em 5s)', 'blue');
    
    setTimeout(() => {
      startServer();
    }, 5000);
    
  } catch (error) {
    log(`❌ Erro durante configuração: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
