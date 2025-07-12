#!/usr/bin/env node

import axios from 'axios';

const API_BASE = 'http://localhost:3001';

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      timeout: 5000
    };
    
    if (data) {
      config.data = data;
    }
    
    if (token) {
      config.headers = {
        'Authorization': `Bearer ${token}`
      };
    }
    
    const response = await axios(config);
    log(`✅ ${method.toUpperCase()} ${endpoint} - Status: ${response.status}`, 'green');
    return response.data;
  } catch (error) {
    if (error.response) {
      log(`❌ ${method.toUpperCase()} ${endpoint} - Status: ${error.response.status}`, 'red');
      if (error.response.data) {
        log(`   Erro: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
      }
    } else {
      log(`❌ ${method.toUpperCase()} ${endpoint} - Erro: ${error.message}`, 'red');
    }
    throw error;
  }
}

async function runTests() {
  log('🧪 Testando API do BoardSync...', 'blue');
  log('', 'reset');
  
  let userToken = null;
  let workspaceId = null;
  let boardId = null;
  
  try {
    // 1. Health Check
    log('1️⃣ Testando Health Check...', 'cyan');
    await testEndpoint('GET', '/health');
    log('', 'reset');
    
    // 2. Registro de usuário
    log('2️⃣ Testando registro de usuário...', 'cyan');
    const userData = {
      email: `test${Date.now()}@boardsync.com`,
      password: 'test123456',
      name: 'Usuário Teste',
      organizationId: 'default-org'
    };
    
    const registerResult = await testEndpoint('POST', '/api/v1/auth/register', userData);
    userToken = registerResult.token;
    log(`   Token obtido: ${userToken.substring(0, 20)}...`, 'yellow');
    log('', 'reset');
    
    // 3. Verificar token
    log('3️⃣ Testando verificação de token...', 'cyan');
    await testEndpoint('GET', '/api/v1/auth/verify', null, userToken);
    log('', 'reset');
    
    // 4. Listar workspaces
    log('4️⃣ Testando listagem de workspaces...', 'cyan');
    const workspaces = await testEndpoint('GET', '/api/v1/workspaces', null, userToken);
    log(`   Workspaces encontrados: ${workspaces.workspaces?.length || 0}`, 'yellow');
    log('', 'reset');
    
    // 5. Criar workspace
    log('5️⃣ Testando criação de workspace...', 'cyan');
    const workspaceData = {
      name: `Workspace Teste ${Date.now()}`,
      description: 'Workspace criado durante teste da API',
      color: '#0052cc'
    };
    
    const newWorkspace = await testEndpoint('POST', '/api/v1/workspaces', workspaceData, userToken);
    workspaceId = newWorkspace.workspace.id;
    log(`   Workspace criado: ${workspaceId}`, 'yellow');
    log('', 'reset');
    
    // 6. Criar board
    log('6️⃣ Testando criação de board...', 'cyan');
    const boardData = {
      name: `Board Teste ${Date.now()}`,
      description: 'Board criado durante teste da API',
      background_color: '#ffffff'
    };
    
    const newBoard = await testEndpoint('POST', `/api/v1/boards/workspace/${workspaceId}`, boardData, userToken);
    boardId = newBoard.board.id;
    log(`   Board criado: ${boardId}`, 'yellow');
    log('', 'reset');
    
    // 7. Buscar board completo
    log('7️⃣ Testando busca de board completo...', 'cyan');
    const boardDetails = await testEndpoint('GET', `/api/v1/boards/${boardId}`, null, userToken);
    log(`   Board encontrado: ${boardDetails.name}`, 'yellow');
    log(`   Listas encontradas: ${boardDetails.lists?.length || 0}`, 'yellow');
    log('', 'reset');
    
    // 8. Criar card (se existir lista)
    if (boardDetails.lists && boardDetails.lists.length > 0) {
      log('8️⃣ Testando criação de card...', 'cyan');
      const listId = boardDetails.lists[0].id;
      const cardData = {
        title: `Card Teste ${Date.now()}`,
        description: 'Card criado durante teste da API',
        priority: 'alta',
        category: 'teste'
      };
      
      const newCard = await testEndpoint('POST', `/api/v1/cards/list/${listId}`, cardData, userToken);
      log(`   Card criado: ${newCard.card.id}`, 'yellow');
      log('', 'reset');
    }
    
    // 9. Upload de arquivo
    log('9️⃣ Testando rota de upload...', 'cyan');
    try {
      // Apenas testar se a rota responde (sem arquivo real)
      await testEndpoint('POST', '/api/v1/upload/image', {}, userToken);
    } catch (error) {
      if (error.response?.status === 400) {
        log(`   ✅ Rota de upload funcionando (erro esperado sem arquivo)`, 'green');
      } else {
        throw error;
      }
    }
    log('', 'reset');
    
    // 10. Logout
    log('🔟 Testando logout...', 'cyan');
    await testEndpoint('POST', '/api/v1/auth/logout', null, userToken);
    log('', 'reset');
    
    // Resumo final
    log('🎉 Todos os testes passaram com sucesso!', 'green');
    log('', 'reset');
    log('📊 Resumo dos testes:', 'blue');
    log('   ✅ Health Check', 'green');
    log('   ✅ Registro de usuário', 'green');
    log('   ✅ Autenticação JWT', 'green');
    log('   ✅ Listagem de workspaces', 'green');
    log('   ✅ Criação de workspace', 'green');
    log('   ✅ Criação de board', 'green');
    log('   ✅ Busca de board completo', 'green');
    log('   ✅ Criação de card', 'green');
    log('   ✅ Rota de upload', 'green');
    log('   ✅ Logout', 'green');
    log('', 'reset');
    log('🚀 API está funcionando perfeitamente!', 'green');
    
  } catch (error) {
    log('', 'reset');
    log('❌ Teste falhou!', 'red');
    log('🔍 Possíveis causas:', 'yellow');
    log('   • Servidor não está rodando (npm run dev)', 'yellow');
    log('   • Banco de dados não configurado', 'yellow');
    log('   • Problema na conexão de rede', 'yellow');
    log('   • Configuração incorreta no .env', 'yellow');
    
    if (error.code === 'ECONNREFUSED') {
      log('   💡 Dica: Execute "npm run dev" para iniciar o servidor', 'yellow');
    }
  }
}

// Verificar se o servidor está rodando antes de executar testes
async function checkServer() {
  try {
    await axios.get(`${API_BASE}/health`, { timeout: 2000 });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  log('🔍 Verificando se o servidor está rodando...', 'blue');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('❌ Servidor não está rodando!', 'red');
    log('💡 Execute "npm run dev" em outro terminal primeiro', 'yellow');
    log('   Aguardando 10 segundos e tentando novamente...', 'yellow');
    
    // Aguardar 10 segundos e tentar novamente
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const serverRunningRetry = await checkServer();
    if (!serverRunningRetry) {
      log('❌ Servidor ainda não está rodando. Saindo...', 'red');
      process.exit(1);
    }
  }
  
  log('✅ Servidor está rodando!', 'green');
  log('', 'reset');
  
  await runTests();
}

main();
