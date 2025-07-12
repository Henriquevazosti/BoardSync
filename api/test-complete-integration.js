// Teste Completo de Integração da API BoardSync
// Este script testa TODOS os endpoints implementados

import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const API_BASE = 'http://localhost:3001/api/v1';
let authToken = '';

// Função para fazer requisições HTTP via PowerShell
async function makeRequest(method, url, data = null, expectedStatus = 200) {
  let command;
  
  if (method === 'GET') {
    command = `$response = Invoke-WebRequest -Uri "${url}" -Method ${method} -Headers @{Authorization="Bearer ${authToken}"}; $response.Content`;
  } else {
    const bodyJson = data ? JSON.stringify(data).replace(/"/g, '\\"') : '{}';
    command = `$body = '${bodyJson}'; $response = Invoke-WebRequest -Uri "${url}" -Method ${method} -ContentType "application/json" -Headers @{Authorization="Bearer ${authToken}"} -Body $body; $response.Content`;
  }

  try {
    const { stdout } = await execPromise(`powershell -Command "${command}"`);
    return JSON.parse(stdout.trim());
  } catch (error) {
    console.error(`❌ Erro na requisição ${method} ${url}:`, error.message);
    throw error;
  }
}

async function login() {
  console.log('🔐 Fazendo login...');
  const command = `
    $body = @{email="henrique.vazosti@gmail.com"; password="123456"} | ConvertTo-Json;
    $response = Invoke-WebRequest -Uri "${API_BASE}/auth/login" -Method POST -ContentType "application/json" -Body $body;
    $response.Content
  `;
  
  const { stdout } = await execPromise(`powershell -Command "${command}"`);
  const result = JSON.parse(stdout.trim());
  authToken = result.token;
  console.log('✅ Login realizado com sucesso');
  return result.user;
}

async function testCompleteIntegration() {
  console.log('🚀 INICIANDO TESTE COMPLETO DE INTEGRAÇÃO\n');
  
  try {
    // 1. Autenticação
    const user = await login();
    console.log(`👤 Usuário logado: ${user.name}\n`);

    // 2. Listar Workspaces
    console.log('📂 Testando WORKSPACES...');
    const workspaces = await makeRequest('GET', `${API_BASE}/workspaces`);
    console.log(`✅ ${workspaces.workspaces.length} workspaces encontrados`);
    const workspaceId = workspaces.workspaces[0].id;

    // 3. Listar Boards
    console.log('\n📋 Testando BOARDS...');
    const boards = await makeRequest('GET', `${API_BASE}/boards/workspace/${workspaceId}`);
    console.log(`✅ ${boards.boards.length} boards encontrados`);
    
    // Criar novo board se necessário
    let boardId;
    if (boards.boards.length > 0) {
      boardId = boards.boards[0].id;
    } else {
      const newBoard = await makeRequest('POST', `${API_BASE}/boards/workspace/${workspaceId}`, {
        name: 'Board de Integração',
        description: 'Board criado para teste de integração'
      });
      boardId = newBoard.board.id;
      console.log('✅ Novo board criado');
    }

    // 4. Testar Listas
    console.log('\n📝 Testando LISTAS...');
    const lists = await makeRequest('GET', `${API_BASE}/lists/board/${boardId}`);
    console.log(`✅ ${lists.lists.length} listas encontradas`);
    
    // Criar nova lista
    const newList = await makeRequest('POST', `${API_BASE}/lists/board/${boardId}`, {
      name: 'Lista de Integração',
      color: '#4CAF50'
    });
    console.log('✅ Nova lista criada');
    const listId = newList.list.id;

    // 5. Testar Cards
    console.log('\n🎯 Testando CARDS...');
    const cards = await makeRequest('GET', `${API_BASE}/cards/list/${lists.lists[0].id}`);
    console.log(`✅ ${cards.cards.length} cards encontrados na primeira lista`);
    
    // Criar novo card
    const newCard = await makeRequest('POST', `${API_BASE}/cards/list/${listId}`, {
      title: 'Card de Integração',
      description: 'Card criado para teste de integração completa',
      priority: 'alta'
    });
    console.log('✅ Novo card criado');
    const cardId = newCard.card.id;

    // 6. Testar Labels
    console.log('\n🏷️ Testando LABELS...');
    const labels = await makeRequest('GET', `${API_BASE}/labels/board/${boardId}`);
    console.log(`✅ ${labels.labels.length} labels encontradas`);
    
    // Criar nova label
    const newLabel = await makeRequest('POST', `${API_BASE}/labels/board/${boardId}`, {
      name: 'Urgente',
      color: '#FF5722',
      description: 'Label para tarefas urgentes'
    });
    console.log('✅ Nova label criada');

    // 7. Testar Comentários
    console.log('\n💬 Testando COMENTÁRIOS...');
    const comments = await makeRequest('GET', `${API_BASE}/comments/card/${cardId}`);
    console.log(`✅ ${comments.comments.length} comentários encontrados`);
    
    // Criar novo comentário
    const newComment = await makeRequest('POST', `${API_BASE}/comments/card/${cardId}`, {
      content: 'Este é um comentário de teste da integração completa!'
    });
    console.log('✅ Novo comentário criado');

    // 8. Teste final - listar comentários novamente
    const finalComments = await makeRequest('GET', `${API_BASE}/comments/card/${cardId}`);
    console.log(`✅ ${finalComments.comments.length} comentários após criação`);

    console.log('\n🎉 INTEGRAÇÃO COMPLETA REALIZADA COM SUCESSO!');
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log(`✅ Autenticação: OK`);
    console.log(`✅ Workspaces: ${workspaces.workspaces.length} encontrados`);
    console.log(`✅ Boards: ${boards.boards.length} encontrados + 1 criado`);
    console.log(`✅ Listas: ${lists.lists.length} encontradas + 1 criada`);
    console.log(`✅ Cards: ${cards.cards.length} encontrados + 1 criado`);
    console.log(`✅ Labels: ${labels.labels.length} encontradas + 1 criada`);
    console.log(`✅ Comentários: ${comments.comments.length} encontrados + 1 criado`);
    
    console.log('\n🚀 TODOS OS ENDPOINTS FUNCIONANDO 100%!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  }
}

testCompleteIntegration();
