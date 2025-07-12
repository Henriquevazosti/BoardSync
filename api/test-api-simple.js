import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api/v1';

async function makeApiCall(method, endpoint, body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }
  
  return data;
}

async function testAPI() {
  try {
    console.log('🚀 TESTE SIMPLES DE API');
    console.log('========================================');
    
    // 1. Login
    console.log('🔐 Fazendo login...');
    const loginResult = await makeApiCall('POST', '/auth/login', {
      email: 'henrique.vazosti@gmail.com',
      password: '123456'
    });
    console.log(`✅ Login: ${loginResult.user.name}`);
    const token = loginResult.token;

    // 2. Workspaces
    console.log('\n🏢 Testando workspaces...');
    const workspaces = await makeApiCall('GET', '/workspaces', null, token);
    console.log(`✅ ${workspaces.workspaces.length} workspaces encontrados`);
    
    // Usar um workspace com GUID válido
    const validWorkspace = workspaces.workspaces.find(ws => 
      ws.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    );
    
    if (!validWorkspace) {
      console.log('❌ Nenhum workspace com GUID válido encontrado');
      return;
    }
    
    const workspaceId = validWorkspace.id;
    console.log(`🎯 Usando workspace: ${validWorkspace.name} (${workspaceId})`);

    // 3. Boards
    console.log('\n📋 Testando boards...');
    const boards = await makeApiCall('GET', `/boards/workspace/${workspaceId}`, null, token);
    console.log(`✅ ${boards.boards.length} boards encontrados`);
    
    if (boards.boards.length > 0) {
      const boardId = boards.boards[0].id;
      
      // 4. Lists
      console.log('\n📝 Testando listas...');
      const lists = await makeApiCall('GET', `/lists/board/${boardId}`, null, token);
      console.log(`✅ ${lists.lists.length} listas encontradas`);
      
      if (lists.lists.length > 0) {
        const listId = lists.lists[0].id;
        
        // 5. Cards
        console.log('\n🎯 Testando cards...');
        const cards = await makeApiCall('GET', `/cards/list/${listId}`, null, token);
        console.log(`✅ ${cards.cards.length} cards encontrados`);
        
        // 6. Labels
        console.log('\n🏷️ Testando labels...');
        const labels = await makeApiCall('GET', `/labels/board/${boardId}`, null, token);
        console.log(`✅ ${labels.labels.length} labels encontradas`);
        
        // 7. Comments (se houver cards)
        if (cards.cards.length > 0) {
          const cardId = cards.cards[0].id;
          console.log('\n💬 Testando comentários...');
          const comments = await makeApiCall('GET', `/comments/card/${cardId}`, null, token);
          console.log(`✅ ${comments.comments.length} comentários encontrados`);
        }
      }
    }
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ API está funcionando corretamente');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    process.exit(1);
  }
}

testAPI();
