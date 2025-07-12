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

async function debugBoardStructure() {
  try {
    console.log('🔍 DEBUG - Estrutura das respostas da API');
    
    // Login
    const loginResult = await makeApiCall('POST', '/auth/login', {
      email: 'henrique.vazosti@gmail.com',
      password: '123456'
    });
    const token = loginResult.token;
    
    // Get workspaces
    const workspaces = await makeApiCall('GET', '/workspaces', null, token);
    const workspaceId = workspaces.workspaces.find(ws => 
      ws.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    ).id;
    
    // Get existing boards
    console.log('\n📋 Estrutura GET /boards/workspace/:id:');
    const boards = await makeApiCall('GET', `/boards/workspace/${workspaceId}`, null, token);
    console.log(JSON.stringify(boards, null, 2));
    
    if (boards.boards.length > 0) {
      const boardId = boards.boards[0].id;
      
      console.log('\n📋 Estrutura GET /boards/:id:');
      const boardDetail = await makeApiCall('GET', `/boards/${boardId}`, null, token);
      console.log(JSON.stringify(boardDetail, null, 2));
    }
    
    // Create new board
    console.log('\n📋 Estrutura POST /boards/workspace/:id:');
    const newBoard = await makeApiCall('POST', `/boards/workspace/${workspaceId}`, {
      name: 'Debug Board',
      description: 'Board para debug'
    }, token);
    console.log(JSON.stringify(newBoard, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

debugBoardStructure();
