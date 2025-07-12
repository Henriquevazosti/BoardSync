// Teste Completo de Todos os Endpoints da API
// Script para validar TODOS os endpoints implementados

async function makeApiCall(method, endpoint, body = null) {
  const baseUrl = 'http://localhost:3001/api/v1';
  const url = `${baseUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${global.token || ''}`
  };
  
  const options = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`❌ Erro na requisição ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

async function testAllEndpoints() {
  console.log('🚀 TESTANDO TODOS OS ENDPOINTS DA API\n');
  
  try {
    // ========================================
    // 1. TESTE DE AUTENTICAÇÃO
    // ========================================
    console.log('🔐 TESTE 1: Autenticação');
    console.log('=' .repeat(40));
    
    console.log('📝 Fazendo login...');
    const loginResult = await makeApiCall('POST', '/auth/login', {
      email: 'henrique.vazosti@gmail.com',
      password: '123456'
    });
    
    global.token = loginResult.token;
    console.log(`✅ Login realizado com sucesso: ${loginResult.user.name}`);
    
    // ========================================
    // 2. TESTE DE WORKSPACES
    // ========================================
    console.log('\n🏢 TESTE 2: Workspaces');
    console.log('=' .repeat(40));
    
    console.log('📋 Listando workspaces...');
    const workspacesResult = await makeApiCall('GET', '/workspaces');
    console.log(`✅ ${workspacesResult.workspaces.length} workspaces encontrados`);
    
    const workspaceId = workspacesResult.workspaces[0].id;
    console.log(`🎯 Usando workspace: ${workspacesResult.workspaces[0].name}`);
    
    // ========================================
    // 3. TESTE DE BOARDS
    // ========================================
    console.log('\n📋 TESTE 3: Boards');
    console.log('=' .repeat(40));
    
    console.log('📋 Listando boards...');
    const boardsResult = await makeApiCall('GET', `/boards/workspace/${workspaceId}`);
    console.log(`✅ ${boardsResult.boards.length} boards encontrados`);
    
    let boardId;
    if (boardsResult.boards.length > 0) {
      boardId = boardsResult.boards[0].id;
      console.log(`🎯 Usando board existente: ${boardsResult.boards[0].name}`);
    } else {
      console.log('📝 Criando novo board...');
      const newBoardResult = await makeApiCall('POST', `/boards/workspace/${workspaceId}`, {
        name: 'Board de Teste API',
        description: 'Board criado para teste de endpoints'
      });
      boardId = newBoardResult.data.board.id;
      console.log(`✅ Board criado: ${newBoardResult.data.board.name}`);
    }
    
    // ========================================
    // 4. TESTE DE LISTAS
    // ========================================
    console.log('\n📝 TESTE 4: Listas');
    console.log('=' .repeat(40));
    
    console.log('📝 Listando listas...');
    const listsResult = await makeApiCall('GET', `/lists/board/${boardId}`);
    console.log(`✅ ${listsResult.data.lists.length} listas encontradas`);
    
    let listId;
    if (listsResult.data.lists.length > 0) {
      listId = listsResult.data.lists[0].id;
      console.log(`🎯 Usando lista existente: ${listsResult.data.lists[0].name}`);
    } else {
      console.log('📝 Criando nova lista...');
      const newListResult = await makeApiCall('POST', `/lists/board/${boardId}`, {
        name: 'Lista de Teste API',
        color: '#2196F3'
      });
      listId = newListResult.data.list.id;
      console.log(`✅ Lista criada: ${newListResult.data.list.name}`);
    }
    
    // Teste buscar lista por ID
    console.log('🔍 Buscando lista por ID...');
    const listResult = await makeApiCall('GET', `/lists/${listId}`);
    console.log(`✅ Lista encontrada: ${listResult.data.list.name}`);
    
    // ========================================
    // 5. TESTE DE LABELS
    // ========================================
    console.log('\n🏷️ TESTE 5: Labels');
    console.log('=' .repeat(40));
    
    console.log('🏷️ Listando labels...');
    const labelsResult = await makeApiCall('GET', `/labels/board/${boardId}`);
    console.log(`✅ ${labelsResult.data.labels.length} labels encontradas`);
    
    console.log('📝 Criando nova label...');
    const newLabelResult = await makeApiCall('POST', `/labels/board/${boardId}`, {
      name: 'Teste API',
      color: '#4CAF50',
      description: 'Label criada via teste de API'
    });
    const labelId = newLabelResult.data.label.id;
    console.log(`✅ Label criada: ${newLabelResult.data.label.name}`);
    
    // Teste buscar label por ID
    console.log('🔍 Buscando label por ID...');
    const labelResult = await makeApiCall('GET', `/labels/${labelId}`);
    console.log(`✅ Label encontrada: ${labelResult.data.label.name}`);
    
    // ========================================
    // 6. TESTE DE CARDS
    // ========================================
    console.log('\n🎯 TESTE 6: Cards');
    console.log('=' .repeat(40));
    
    console.log('🎯 Listando cards...');
    const cardsResult = await makeApiCall('GET', `/cards/list/${listId}`);
    console.log(`✅ ${cardsResult.data.cards.length} cards encontrados`);
    
    console.log('📝 Criando novo card...');
    const newCardResult = await makeApiCall('POST', `/cards/list/${listId}`, {
      title: 'Card de Teste API',
      description: 'Card criado para teste completo de endpoints',
      priority: 'alta',
      category: 'feature'
    });
    const cardId = newCardResult.data.card.id;
    console.log(`✅ Card criado: ${newCardResult.data.card.title}`);
    
    // Teste buscar card por ID
    console.log('🔍 Buscando card por ID...');
    const cardResult = await makeApiCall('GET', `/cards/${cardId}`);
    console.log(`✅ Card encontrado: ${cardResult.data.card.title}`);
    
    // Teste atualizar card
    console.log('✏️ Atualizando card...');
    const updateCardResult = await makeApiCall('PUT', `/cards/${cardId}`, {
      title: 'Card de Teste API (Atualizado)',
      description: 'Card atualizado via teste de API'
    });
    console.log(`✅ Card atualizado: ${updateCardResult.data.card.title}`);
    
    // ========================================
    // 7. TESTE DE COMENTÁRIOS
    // ========================================
    console.log('\n💬 TESTE 7: Comentários');
    console.log('=' .repeat(40));
    
    console.log('💬 Listando comentários...');
    const commentsResult = await makeApiCall('GET', `/comments/card/${cardId}`);
    console.log(`✅ ${commentsResult.data.comments.length} comentários encontrados`);
    
    console.log('📝 Criando novo comentário...');
    const newCommentResult = await makeApiCall('POST', `/comments/card/${cardId}`, {
      content: 'Este é um comentário de teste criado via API! 🚀'
    });
    const commentId = newCommentResult.data.comment.id;
    console.log(`✅ Comentário criado: ${newCommentResult.data.comment.content.substring(0, 50)}...`);
    
    // Teste buscar comentário por ID
    console.log('🔍 Buscando comentário por ID...');
    const commentResult = await makeApiCall('GET', `/comments/${commentId}`);
    console.log(`✅ Comentário encontrado: ${commentResult.data.comment.content.substring(0, 50)}...`);
    
    // Teste atualizar comentário
    console.log('✏️ Atualizando comentário...');
    const updateCommentResult = await makeApiCall('PUT', `/comments/${commentId}`, {
      content: 'Comentário atualizado via teste de API! ✅'
    });
    console.log(`✅ Comentário atualizado: ${updateCommentResult.data.comment.content}`);
    
    // Listar comentários novamente
    console.log('📋 Listando comentários após criação...');
    const finalCommentsResult = await makeApiCall('GET', `/comments/card/${cardId}`);
    console.log(`✅ ${finalCommentsResult.data.comments.length} comentários no total`);
    
    // ========================================
    // RESUMO FINAL
    // ========================================
    console.log('\n🎉 RESUMO FINAL DOS TESTES DE API');
    console.log('=' .repeat(50));
    
    console.log('\n✅ TODOS OS ENDPOINTS TESTADOS COM SUCESSO:');
    console.log('🔐 Autenticação: Login - OK');
    console.log('🏢 Workspaces: Listagem - OK');
    console.log('📋 Boards: Listagem e Criação - OK');
    console.log('📝 Listas: Listagem, Criação e Busca - OK');
    console.log('🏷️ Labels: Listagem, Criação e Busca - OK');
    console.log('🎯 Cards: Listagem, Criação, Busca e Atualização - OK');
    console.log('💬 Comentários: Listagem, Criação, Busca e Atualização - OK');
    
    console.log('\n📊 ESTATÍSTICAS DO TESTE:');
    console.log(`🏢 Workspaces testados: ${workspacesResult.data.workspaces.length}`);
    console.log(`📋 Boards testados: ${boardsResult.data.boards.length}`);
    console.log(`📝 Listas testadas: ${listsResult.data.lists.length}`);
    console.log(`🏷️ Labels testadas: ${labelsResult.data.labels.length + 1}`);
    console.log(`🎯 Cards testados: ${cardsResult.data.cards.length + 1}`);
    console.log(`💬 Comentários testados: ${finalCommentsResult.data.comments.length}`);
    
    console.log('\n🚀 INTEGRAÇÃO COMPLETA E TODOS OS ENDPOINTS FUNCIONAIS!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

// Polyfill para fetch em Node.js
import fetch from 'node-fetch';
global.fetch = fetch;

testAllEndpoints();
