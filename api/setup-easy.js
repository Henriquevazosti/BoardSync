#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configurando BoardSync Backend...\n');

// Verificar se temos Docker disponível
function hasDocker() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Verificar se temos PostgreSQL local
function hasPostgreSQL() {
  try {
    execSync('psql --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Criar arquivo .env se não existir
function createEnvFile() {
  const envPath = '.env';
  const envExamplePath = '.env.example';
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Arquivo .env criado a partir do .env.example');
    } else {
      // Criar .env básico
      const envContent = `NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boardsync
DB_USER=boardsync_user
DB_PASSWORD=boardsync_pass
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
SESSION_SECRET=your_super_secret_session_key_change_this_too
`;
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Arquivo .env criado com configurações padrão');
    }
  } else {
    console.log('ℹ️ Arquivo .env já existe');
  }
}

// Instalar dependências
function installDependencies() {
  console.log('📦 Instalando dependências...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependências instaladas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao instalar dependências:', error.message);
    process.exit(1);
  }
}

// Criar diretórios necessários
function createDirectories() {
  const dirs = ['logs', 'uploads'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Diretório ${dir}/ criado`);
    }
  });
}

// Configuração com Docker
function setupWithDocker() {
  console.log('🐳 Docker detectado! Configurando com Docker...\n');
  
  try {
    console.log('🏗️ Construindo e iniciando containers...');
    execSync('docker-compose up -d --build', { stdio: 'inherit' });
    
    console.log('\n⏳ Aguardando containers ficarem prontos...');
    // Aguardar um pouco para os containers iniciarem
    setTimeout(() => {
      console.log('\n✅ Configuração com Docker concluída!');
      console.log('\n🔧 Comandos úteis:');
      console.log('- Ver logs: docker-compose logs -f');
      console.log('- Parar: docker-compose down');
      console.log('- Reiniciar: docker-compose restart');
      console.log('- Acessar DB: docker-compose exec postgres psql -U boardsync_user -d boardsync');
      console.log('\n🌐 API rodando em: http://localhost:3001');
      console.log('🗄️ PostgreSQL rodando em: localhost:5432');
    }, 5000);
    
  } catch (error) {
    console.error('❌ Erro ao configurar com Docker:', error.message);
    console.log('\n💡 Tente a configuração manual ou instale o PostgreSQL localmente');
    process.exit(1);
  }
}

// Configuração manual
function setupManually() {
  console.log('⚙️ Configurando manualmente...\n');
  
  if (!hasPostgreSQL()) {
    console.log('❌ PostgreSQL não encontrado!');
    console.log('   Por favor, instale o PostgreSQL:');
    console.log('   - Windows: https://www.postgresql.org/download/windows/');
    console.log('   - macOS: brew install postgresql');
    console.log('   - Ubuntu: sudo apt-get install postgresql');
    console.log('\n   Ou use Docker: npm run docker:setup');
    process.exit(1);
  }
  
  console.log('✅ PostgreSQL encontrado');
  console.log('\n📋 Próximos passos manuais:');
  console.log('1. Criar banco de dados: createdb boardsync');
  console.log('2. Executar schema: psql -d boardsync -f database/schema.sql');
  console.log('3. Iniciar servidor: npm start');
  console.log('4. Testar API: npm run test:api');
}

// Função principal
async function main() {
  // Configurações básicas
  createEnvFile();
  createDirectories();
  installDependencies();
  
  console.log('\n🔍 Verificando opções de configuração...\n');
  
  if (hasDocker()) {
    setupWithDocker();
  } else {
    setupManually();
  }
}

// Executar
main().catch(error => {
  console.error('❌ Erro na configuração:', error.message);
  process.exit(1);
});
